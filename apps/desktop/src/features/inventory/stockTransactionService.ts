import { apiRequest } from '../../services/apiClient';
import {
  CreateStockInInput,
  CreateStockOutInput,
  StockTransactionDetailResponse,
  StockTransactionListResponse,
  StockTransactionMutationResponse,
  UpdateStockTransactionInput,
} from './types';

export interface GetTransactionsParams {
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

export const stockTransactionService = {
  async getTransactions(params?: GetTransactionsParams): Promise<StockTransactionListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.per_page) searchParams.append('per_page', String(params.per_page));

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return await apiRequest<StockTransactionListResponse>(`/stock-transactions${query}`, {
      method: 'GET',
    });
  },

  async getTransactionDetail(id: number): Promise<StockTransactionDetailResponse> {
    return await apiRequest<StockTransactionDetailResponse>(`/stock-transactions/${id}`, {
      method: 'GET',
    });
  },

  async createStockIn(input: CreateStockInInput): Promise<StockTransactionMutationResponse> {
    return await apiRequest<StockTransactionMutationResponse>('/stock-in', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async createStockOut(input: CreateStockOutInput): Promise<StockTransactionMutationResponse> {
    return await apiRequest<StockTransactionMutationResponse>('/stock-out', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateTransaction(
    id: number,
    input: UpdateStockTransactionInput
  ): Promise<StockTransactionMutationResponse> {
    return await apiRequest<StockTransactionMutationResponse>(`/stock-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async confirmTransaction(id: number): Promise<StockTransactionMutationResponse> {
    return await apiRequest<StockTransactionMutationResponse>(`/stock-transactions/${id}/confirm`, {
      method: 'POST',
    });
  },

  async cancelTransaction(id: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/stock-transactions/${id}/cancel`, {
      method: 'POST',
    });
  },
};
