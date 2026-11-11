// Placeholder for shared API schemas and generated types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface HealthResponse {
  status: string;
}

export interface DbHealthResponse {
  status: string;
  database: string;
}
