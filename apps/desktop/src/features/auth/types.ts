export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role: 'admin_gudang' | 'admin_kasir' | string;
  is_active?: number | boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    access_token?: string;
    user?: User;
  };
  user?: User;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
