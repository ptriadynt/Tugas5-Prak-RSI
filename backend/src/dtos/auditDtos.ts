export interface AuditLogDto {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuditListResponseDto {
  items: AuditLogDto[];
  pagination: AuditPaginationDto;
}

export interface CreateAuditLogInput {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: Record<string, unknown> | string | null;
}
