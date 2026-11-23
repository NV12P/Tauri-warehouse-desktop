export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/';
const API_ROOT = API_BASE_URL.replace(/\/+$/, '');

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let isHandlingUnauthorized = false;

/** Dipanggil App sekali saat mount untuk menangani token kedaluwarsa. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(): void {
  if (!unauthorizedHandler || isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;
  try {
    unauthorizedHandler();
  } finally {
    isHandlingUnauthorized = false;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan.'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function extractErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'object' && data !== null) {
    const record = data as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message) {
      return record.message;
    }

    if (typeof record.errors === 'object' && record.errors !== null) {
      const messages = Object.values(record.errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

      if (messages.length > 0) {
        return messages.join(', ');
      }
    }
  }

  return `Permintaan gagal dengan status ${status}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_ROOT}${cleanEndpoint}`;

  const token = localStorage.getItem('auth_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        notifyUnauthorized();
      }
      throw new ApiError(extractErrorMessage(data, response.status), response.status, data);
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Tidak dapat terhubung ke server API (${API_BASE_URL}). Pastikan server backend sedang berjalan.`,
      0,
      error
    );
  }
}

export { API_ROOT };
