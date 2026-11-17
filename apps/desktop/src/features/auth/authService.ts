import { apiRequest } from '../../services/apiClient';
import { LoginCredentials, LoginResponse, User } from './types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const token = this.extractToken(response);
    const user = this.extractUser(response);

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return response;
  },

  extractToken(response: LoginResponse): string | null {
    if (response.token) return response.token;
    if (response.access_token) return response.access_token;
    if (response.data?.token) return response.data.token;
    if (response.data?.access_token) return response.data.access_token;
    return null;
  },

  extractUser(response: LoginResponse): User | null {
    if (response.user) return response.user;
    if (response.data?.user) return response.data.user;
    return null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
