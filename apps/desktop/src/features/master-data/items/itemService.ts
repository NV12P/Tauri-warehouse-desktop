import { apiRequest, API_ROOT } from '../../../services/apiClient';
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

/** Payload form barang. File foto dikirim langsung ke endpoint `/items`. */
export interface ItemSaveInput extends ItemInput {
  photo?: File;
}

const API_ORIGIN = API_ROOT.replace(/\/api\/v1\/?$/, '');

type ItemPhotoSource = Pick<
  Item,
  'photo_path' | 'photo_url' | 'photo' | 'image_url' | 'image'
>;

function firstNonEmptyPhoto(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function getItemPhotoUrl(item: ItemPhotoSource): string | null {
  const photo = firstNonEmptyPhoto(
    item.photo_url,
    item.photo_path,
    item.photo,
    item.image_url,
    item.image
  );
  if (!photo) return null;

  if (/^(data:|blob:)/i.test(photo)) return photo;

  if (/^https?:\/\//i.test(photo)) {
    try {
      const parsed = new URL(photo);
      // Laravel kadang mengembalikan http://localhost/storage/... tanpa port 8000.
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      // Biarkan apa adanya jika bukan URL yang valid.
    }
    return photo;
  }

  const relative = photo.replace(/^\.\//, '');
  if (relative.startsWith('/')) return `${API_ORIGIN}${relative}`;
  if (relative.startsWith('storage/')) return `${API_ORIGIN}/${relative}`;
  return `${API_ORIGIN}/storage/${relative}`;
}

function appendFormValue(form: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
}

function buildItemFormData(input: Partial<ItemSaveInput>): FormData {
  const form = new FormData();
  const { photo, ...fields } = input;

  Object.entries(fields).forEach(([key, value]) => {
    appendFormValue(form, key, value);
  });

  // Sesuai StoreProductRequest/UpdateProductRequest: field file bernama `photo`.
  if (photo) {
    form.append('photo', photo);
  }

  return form;
}

function toJsonPayload(input: Partial<ItemSaveInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...input };
  delete payload.photo;
  return payload;
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

  async createItem(input: ItemSaveInput): Promise<ItemMutationResponse> {
    if (input.photo) {
      return await apiRequest<ItemMutationResponse>('/items', {
        method: 'POST',
        body: buildItemFormData(input),
      });
    }

    return await apiRequest<ItemMutationResponse>('/items', {
      method: 'POST',
      body: JSON.stringify(toJsonPayload(input)),
    });
  },

  async updateItem(id: number, input: Partial<ItemSaveInput>): Promise<ItemMutationResponse> {
    if (input.photo) {
      // PHP tidak mengisi $_FILES untuk PUT multipart. Laravel menerima method
      // spoofing lewat field `_method` pada request POST.
      const form = buildItemFormData(input);
      form.append('_method', 'PUT');
      return await apiRequest<ItemMutationResponse>(`/items/${id}`, {
        method: 'POST',
        body: form,
      });
    }

    return await apiRequest<ItemMutationResponse>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toJsonPayload(input)),
    });
  },

  async deleteItemPhoto(id: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/items/${id}/photo`, {
      method: 'DELETE',
    });
  },

  async deleteItem(id: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};
