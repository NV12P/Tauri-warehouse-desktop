export interface DashboardStats {
  totalCategories: number;
  activeCategories: number;
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  todayTransactions: number;
  pendingTransactions: number;
  totalStockIn: number;
  totalStockOut: number;
}

export interface DashboardRecentTransaction {
  id: number;
  transaction_number: string;
  type: 'stock_in' | 'stock_out' | 'correction' | 'stock_opname';
  status: 'draft' | 'confirmed' | 'cancelled';
  transaction_date: string;
  items_count: number;
  created_by: string;
  created_at: string;
}

export interface DashboardCriticalItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  category: string;
  status: 'out_of_stock' | 'low_stock';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
