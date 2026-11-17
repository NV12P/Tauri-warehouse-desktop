import { apiRequest } from '../../../services/apiClient';
import {
  Category,
  CategoryInput,
  CategoryListResponse,
  CategoryMutationResponse,
} from './types';

export const categoryService = {
  async getCategories(params?: { is_active?: boolean; per_page?: number }): Promise<CategoryListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) {
      searchParams.append('is_active', String(params.is_active));
    }
    if (params?.per_page) {
      searchParams.append('per_page', String(params.per_page));
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return await apiRequest<CategoryListResponse>(`/categories${query}`, {
      method: 'GET',
    });
  },

  async getCategory(id: number): Promise<{ category: Category }> {
    return await apiRequest<{ category: Category }>(`/categories/${id}`, {
      method: 'GET',
    });
  },

  async createCategory(input: CategoryInput): Promise<CategoryMutationResponse> {
    return await apiRequest<CategoryMutationResponse>('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateCategory(id: number, input: CategoryInput): Promise<CategoryMutationResponse> {
    return await apiRequest<CategoryMutationResponse>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
