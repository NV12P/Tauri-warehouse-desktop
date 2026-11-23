export interface ItemCategory {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  category: ItemCategory;
  unit: string;
  barcode: string | null;
  brand: string | null;
  selling_price: string | number | null;
  purchase_price: string | number | null;
  min_stock: string | number;
  current_stock: string | number;
  is_active: boolean;
  /** Nama file hasil upload di server API. */
  photo_path?: string | null;
  /** URL gambar penuh (kompatibilitas dengan API lama). */
  photo_url?: string | null;
  /** Alternatif field yang mungkin dipakai ProductResource Laravel. */
  photo?: string | null;
  image_url?: string | null;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ItemInput {
  code?: string;
  name: string;
  category_id: number;
  unit: string;
  barcode?: string;
  brand?: string;
  purchase_price?: number;
  selling_price?: number;
  min_stock?: number;
  is_active?: boolean;
  photo_path?: string | null;
}

export interface ItemListResponse {
  data: Item[];
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

export interface ItemDetailResponse {
  item: Item;
  message?: string;
}

export interface ItemMutationResponse {
  message: string;
  item?: Item;
}

export interface ItemImageUploadResponse {
  photo_path: string;
  url: string;
  message?: string;
}
