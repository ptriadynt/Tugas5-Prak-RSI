import { apiClient } from './client';
import type { ApiResponse, LoginResponseData, User } from '../types/auth';

export async function loginApi(credentials: { email: string; password: string }): Promise<LoginResponseData> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
  if (!response.data.data) {
    throw new Error('Format respon login tidak valid');
  }
  return response.data.data;
}

export async function registerApi(data: { name: string; email: string; password: string }): Promise<User> {
  const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data);
  if (!response.data.data?.user) {
    throw new Error('Format respon registrasi tidak valid');
  }
  return response.data.data.user;
}

export async function getMeApi(): Promise<User> {
  const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  if (!response.data.data?.user) {
    throw new Error('Data profil pengguna tidak valid');
  }
  return response.data.data.user;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}
