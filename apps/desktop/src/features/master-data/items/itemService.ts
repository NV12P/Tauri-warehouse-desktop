import { apiRequest } from '../../../services/apiClient';
import {
  Item,
  ItemInput,
  ItemListResponse,
  ItemMutationResponse,
} from './types';

export interface GetItemsParams {
  category_id?: number;
  stock_condition?: 'low_stock' | 'out_of_stock';
  is_active?: boolean;
  per_page?: number;
}

export const itemService = {
  async getItems(params?: GetItemsParams): Promise<ItemListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.category_id) {
      searchParams.append('category_id', String(params.category_id));
    }
    if (params?.stock_condition) {
      searchParams.append('stock_condition', params.stock_condition);
    }
    if (params?.is_active !== undefined) {
      searchParams.append('is_active', String(params.is_active));
    }
    if (params?.per_page) {
      searchParams.append('per_page', String(params.per_page));
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return await apiRequest<ItemListResponse>(`/items${query}`, {
      method: 'GET',
    });
  },

  async searchItems(q: string, category_id?: number): Promise<ItemListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', q);
    if (category_id) {
      searchParams.append('category_id', String(category_id));
    }
    searchParams.append('per_page', '50');

    return await apiRequest<ItemListResponse>(`/items/search?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  async getItem(id: number): Promise<{ item: Item }> {
    return await apiRequest<{ item: Item }>(`/items/${id}`, {
      method: 'GET',
    });
  },

  async createItem(input: ItemInput): Promise<ItemMutationResponse> {
    return await apiRequest<ItemMutationResponse>('/items', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateItem(id: number, input: Partial<ItemInput>): Promise<ItemMutationResponse> {
    return await apiRequest<ItemMutationResponse>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteItem(id: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};
