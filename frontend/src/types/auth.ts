export type UserRole = 'admin' | 'owner' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponseData {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

