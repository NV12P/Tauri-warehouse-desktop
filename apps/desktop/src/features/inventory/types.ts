export type TransactionType = 'stock_in' | 'stock_out' | 'correction' | 'stock_opname';
export type TransactionStatus = 'draft' | 'confirmed' | 'cancelled';

export interface TransactionProduct {
  id: number;
  code: string;
  name: string;
  unit: string;
}

export interface StockTransactionItem {
  id: number;
  product: TransactionProduct;
  quantity: string | number;
  purchase_price: string | number | null;
  total_purchase: string | number | null;
  stock_before: string | number;
  stock_after: string | number;
}

export interface StockTransactionUser {
  id: number;
  name: string;
}

export interface StockTransaction {
  id: number;
  transaction_number: string;
  type: TransactionType;
  status: TransactionStatus;
  transaction_date: string;
  note: string | null;
  reason: string | null;
  idempotency_key?: string | null;
  items_count?: number;
  items?: StockTransactionItem[];
  created_by: StockTransactionUser;
  confirmed_by?: StockTransactionUser | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface StockTransactionItemInput {
  product_id: number;
  quantity: number;
  purchase_price?: number;
}

export interface CreateStockInInput {
  transaction_date: string;
  note?: string;
  items: StockTransactionItemInput[];
}

export interface CreateStockOutInput {
  transaction_date: string;
  note?: string;
  reason?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface StockTransactionListResponse {
  data: StockTransaction[];
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

export interface StockTransactionDetailResponse {
  transaction: StockTransaction;
  message?: string;
}

export interface StockTransactionMutationResponse {
  message: string;
  transaction: StockTransaction;
}
