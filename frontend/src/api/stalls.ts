import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';
import type { CreateStallDto, Stall, StallQueryParams, UpdateStallDto } from '../types/stall';

export interface StallsListResult {
  stalls: Stall[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function getStallsApi(params?: StallQueryParams): Promise<StallsListResult> {
  const response = await apiClient.get<ApiResponse<Stall[]>>('/stalls', {
    params: {
      search: params?.search || undefined,
      category: params?.category || undefined,
      page: params?.page || 1,
      limit: params?.limit || 9,
    },
  });

  return {
    stalls: response.data.data || [],
    meta: response.data.meta || { page: 1, limit: 9, total: (response.data.data || []).length },
  };
}

export async function getStallByIdApi(id: number | string): Promise<Stall> {
  const response = await apiClient.get<ApiResponse<Stall>>(`/stalls/${id}`);
  if (!response.data.data) {
    throw new Error('Data warung tidak ditemukan');
  }
  return response.data.data;
}

export async function createStallApi(payload: CreateStallDto): Promise<Stall> {
  const response = await apiClient.post<ApiResponse<Stall>>('/stalls', payload);
  if (!response.data.data) {
    throw new Error('Gagal membuat data warung');
  }
  return response.data.data;
}

export async function updateStallApi(id: number | string, payload: UpdateStallDto): Promise<Stall> {
  const response = await apiClient.put<ApiResponse<Stall>>(`/stalls/${id}`, payload);
  if (!response.data.data) {
    throw new Error('Gagal memperbarui data warung');
  }
  return response.data.data;
}

export async function deleteStallApi(id: number | string): Promise<Stall> {
  const response = await apiClient.delete<ApiResponse<Stall>>(`/stalls/${id}`);
  return response.data.data as Stall;
}

