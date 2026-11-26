
import { eq } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { users } from "../db/schema.ts";

export type UserRole = "admin" | "owner" | "customer";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export class UserRepository {
  async findAll() {
    const db = await getDb();

    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);
  }

  async findByEmail(email: string) {
    const db = await getDb();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return rows[0];
  }

  async findById(id: number) {
    const db = await getDb();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return rows[0];
  }

  async create(input: CreateUserInput) {
    const db = await getDb();

    const rows = await db
      .insert(users)
      .output()
      .values({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
      });

    return rows[0];
  }

  async updateRole(id: number, role: UserRole) {
    const db = await getDb();

    const rows = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .output();

    if (!rows[0]) return null;

    return {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      createdAt: rows[0].createdAt,
    };
  }
}
