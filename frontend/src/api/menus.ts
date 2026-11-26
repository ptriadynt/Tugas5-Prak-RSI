import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';
import type { CreateMenuItemDto, MenuItem, UpdateMenuItemDto } from '../types/stall';

export async function getStallMenusApi(stallId: number | string): Promise<MenuItem[]> {
  const response = await apiClient.get<ApiResponse<MenuItem[]>>(`/stalls/${stallId}/menus`);
  return response.data.data || [];
}

export async function createMenuItemApi(payload: CreateMenuItemDto): Promise<MenuItem> {
  const response = await apiClient.post<ApiResponse<MenuItem>>('/menus', payload);
  if (!response.data.data) {
    throw new Error('Gagal menambahkan menu');
  }
  return response.data.data;
}

export async function updateMenuItemApi(id: number | string, payload: UpdateMenuItemDto): Promise<MenuItem> {
  const response = await apiClient.put<ApiResponse<MenuItem>>(`/menus/${id}`, payload);
  if (!response.data.data) {
    throw new Error('Gagal memperbarui menu');
  }
  return response.data.data;
}

export async function deleteMenuItemApi(id: number | string): Promise<MenuItem> {
  const response = await apiClient.delete<ApiResponse<MenuItem>>(`/menus/${id}`);
  return response.data.data as MenuItem;
}

