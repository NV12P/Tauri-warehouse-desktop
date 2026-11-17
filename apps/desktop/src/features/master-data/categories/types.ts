export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryListResponse {
  data: Category[];
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface CategoryDetailResponse {
  category: Category;
  message?: string;
}

export interface CategoryMutationResponse {
  message: string;
  category?: Category;
}
