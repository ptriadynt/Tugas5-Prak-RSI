import { apiClient } from './client';
import type { AuditListResponse, AuditLog, AuditQueryParams } from '../types/audit';

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export async function getAuditLogsApi(params?: AuditQueryParams): Promise<AuditListResponse> {
  const cleanParams: Record<string, any> = {};
  if (params) {
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
    if (params.action) cleanParams.action = params.action;
    if (params.targetTable) cleanParams.targetTable = params.targetTable;
    if (params.targetId !== undefined && params.targetId !== null) cleanParams.targetId = params.targetId;
    if (params.userId !== undefined && params.userId !== null) cleanParams.userId = params.userId;
    if (params.from) cleanParams.from = params.from;
    if (params.to) cleanParams.to = params.to;
  }

  const response = await apiClient.get<ApiResponse<AuditListResponse>>('/api/audit-logs', {
    params: cleanParams,
  });

  return response.data.data;
}

export async function getAuditLogByIdApi(id: number): Promise<AuditLog> {
  const response = await apiClient.get<ApiResponse<AuditLog>>(`/api/audit-logs/${id}`);
  return response.data.data;
}
