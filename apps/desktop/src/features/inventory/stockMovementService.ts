import { apiRequest } from '../../services/apiClient';
import {
  MovementType,
  StockMovementDetailResponse,
  StockMovementListResponse,
} from './types';

export interface GetMovementsParams {
  product_id?: number;
  movement_type?: MovementType;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

export const stockMovementService = {
  async getMovements(params?: GetMovementsParams): Promise<StockMovementListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.product_id) searchParams.append('product_id', String(params.product_id));
    if (params?.movement_type) searchParams.append('movement_type', params.movement_type);
    if (params?.user_id) searchParams.append('user_id', String(params.user_id));
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.per_page) searchParams.append('per_page', String(params.per_page));
    if (params?.page) searchParams.append('page', String(params.page));

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return await apiRequest<StockMovementListResponse>(`/stock-movements${query}`, {
      method: 'GET',
    });
  },

  async getMovement(id: number): Promise<StockMovementDetailResponse> {
    return await apiRequest<StockMovementDetailResponse>(`/stock-movements/${id}`, {
      method: 'GET',
    });
  },
};
