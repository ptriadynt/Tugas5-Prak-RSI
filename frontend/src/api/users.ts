import { apiClient } from './client';
import type { ApiResponse, User, UserRole } from '../types/auth';

export async function getUsersApi(): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');
  return response.data.data || [];
}

export async function updateUserRoleApi(id: number, role: UserRole): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
  if (!response.data.data) {
    throw new Error('Gagal memperbarui role pengguna');
  }
  return response.data.data;
}

