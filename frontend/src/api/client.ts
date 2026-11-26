import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Menambahkan Authorization header jika token ada
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Penanganan 401 dan pemetaan error
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ status?: string; message?: string; errors?: Array<{ field?: string; message: string }> }>) => {
    if (error.response?.status === 401) {
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth-session-expired', {
          detail: { message: 'Sesi telah berakhir atau Anda belum login. Silakan login kembali.' }
        }));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper untuk mengambil pesan error ramah pengguna dari respon backend
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) {
      return data.message;
    }
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e: { message: string }) => e.message).join(', ');
    }
    if (error.response?.status === 403) {
      return 'Anda tidak punya izin untuk aksi ini (403 Forbidden)';
    }
    if (error.response?.status === 404) {
      return 'Data yang dicari tidak ditemukan (404 Not Found)';
    }
    if (error.response?.status === 401) {
      return 'Sesi tidak valid atau belum terautentikasi (401 Unauthorized)';
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      return 'Gagal terhubung ke server backend. Pastikan server sedang berjalan.';
    }
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan sistem yang tidak terduga';
}
