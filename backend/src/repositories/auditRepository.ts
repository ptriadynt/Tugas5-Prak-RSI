import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { auditLogs, users } from "../db/schema.ts";
import type { CreateAuditLogInput } from "../dtos/auditDtos.ts";
import type { AuditQueryInput } from "../schemas/auditSchema.ts";

export class AuditRepository {
  async findAll(params: AuditQueryInput) {
    const db = await getDb();

    const conditions: SQL[] = [];

    if (params.action) {
      conditions.push(eq(auditLogs.action, params.action));
    }
    if (params.targetTable) {
      conditions.push(eq(auditLogs.targetTable, params.targetTable));
    }
    if (params.targetId !== undefined) {
      conditions.push(eq(auditLogs.targetId, params.targetId));
    }
    if (params.userId !== undefined) {
      conditions.push(eq(auditLogs.userId, params.userId));
    }
    if (params.from) {
      conditions.push(sql`${auditLogs.createdAt} >= ${params.from + " 00:00:00"}`);
    }
    if (params.to) {
      conditions.push(sql`${auditLogs.createdAt} <= ${params.to + " 23:59:59.999"}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count matching filters
    const countResult = await db
      .select({ total: count() })
      .from(auditLogs)
      .where(whereClause);

    const total = Number(countResult[0]?.total ?? 0);

    const limit = params.pageSize;
    const offset = (params.page - 1) * params.pageSize;

    // Query items with JOIN USERS
    const rows = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: auditLogs.action,
        targetTable: auditLogs.targetTable,
        targetId: auditLogs.targetId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .offset(offset)
      .fetch(limit);

    return { rows, total };
  }

  async findById(id: number) {
    const db = await getDb();

    const rows = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: auditLogs.action,
        targetTable: auditLogs.targetTable,
        targetId: auditLogs.targetId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, id));

    return rows[0] || null;
  }

  async create(input: CreateAuditLogInput, tx?: any) {
    const executor = tx ?? (await getDb());

    const metadataStr =
      typeof input.metadata === "object" && input.metadata !== null
        ? JSON.stringify(input.metadata)
        : ((input.metadata as string | null | undefined) ?? null);

    const rows = await executor
      .insert(auditLogs)
      .values({
        userId: input.userId,
        action: input.action,
        targetTable: input.targetTable,
        targetId: input.targetId,
        metadata: metadataStr,
      });

    return rows;
  }
}
