import { categoryService } from '../master-data/categories/categoryService';
import { itemService } from '../master-data/items/itemService';
import { stockTransactionService } from '../inventory/stockTransactionService';
import {
  DashboardStats,
  DashboardRecentTransaction,
  DashboardCriticalItem,
} from './types';

export interface DashboardData {
  stats: DashboardStats;
  recentTransactions: DashboardRecentTransaction[];
  criticalItems: DashboardCriticalItem[];
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    // Fetch semua data secara paralel untuk efisiensi
    const [
      allCategoriesRes,
      activeCategoriesRes,
      allItemsRes,
      lowStockRes,
      outOfStockRes,
      allTransactionsRes,
      confirmedStockInRes,
      confirmedStockOutRes,
      pendingTransactionsRes,
    ] = await Promise.allSettled([
      categoryService.getCategories({ per_page: 1 }),
      categoryService.getCategories({ is_active: true, per_page: 1 }),
      itemService.getItems({ is_active: true, per_page: 1 }),
      itemService.getItems({ stock_condition: 'low_stock', per_page: 5 }),
      itemService.getItems({ stock_condition: 'out_of_stock', per_page: 5 }),
      stockTransactionService.getTransactions({ per_page: 8 }),
      stockTransactionService.getTransactions({ type: 'stock_in', status: 'confirmed', per_page: 1 }),
      stockTransactionService.getTransactions({ type: 'stock_out', status: 'confirmed', per_page: 1 }),
      stockTransactionService.getTransactions({ status: 'draft', per_page: 1 }),
    ]);

    const getValue = <T>(result: PromiseSettledResult<T>): T | null =>
      result.status === 'fulfilled' ? result.value : null;

    const allCategories = getValue(allCategoriesRes);
    const activeCategories = getValue(activeCategoriesRes);
    const allItems = getValue(allItemsRes);
    const lowStockData = getValue(lowStockRes);
    const outOfStockData = getValue(outOfStockRes);
    const allTransactions = getValue(allTransactionsRes);
    const stockInData = getValue(confirmedStockInRes);
    const stockOutData = getValue(confirmedStockOutRes);
    const pendingData = getValue(pendingTransactionsRes);

    const stats: DashboardStats = {
      totalCategories: allCategories?.meta?.total ?? 0,
      activeCategories: activeCategories?.meta?.total ?? 0,
      totalItems: allItems?.meta?.total ?? 0,
      activeItems: allItems?.meta?.total ?? 0,
      lowStockItems: lowStockData?.meta?.total ?? 0,
      outOfStockItems: outOfStockData?.meta?.total ?? 0,
      todayTransactions: allTransactions?.meta?.total ?? 0,
      pendingTransactions: pendingData?.meta?.total ?? 0,
      totalStockIn: stockInData?.meta?.total ?? 0,
      totalStockOut: stockOutData?.meta?.total ?? 0,
    };

    // Gabungkan dan deduplikasi barang kritis (out of stock diprioritaskan)
    const outOfStockItems = (outOfStockData?.data ?? []).map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      current_stock: Number(item.current_stock),
      min_stock: Number(item.min_stock),
      category: item.category.name,
      status: 'out_of_stock' as const,
    }));

    const outOfStockIds = new Set(outOfStockItems.map((i) => i.id));
    const lowStockItems = (lowStockData?.data ?? [])
      .filter((item) => !outOfStockIds.has(item.id))
      .map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        unit: item.unit,
        current_stock: Number(item.current_stock),
        min_stock: Number(item.min_stock),
        category: item.category.name,
        status: 'low_stock' as const,
      }));

    const criticalItems: DashboardCriticalItem[] = [...outOfStockItems, ...lowStockItems].slice(0, 6);

    const recentTransactions: DashboardRecentTransaction[] = (allTransactions?.data ?? []).map(
      (tx) => ({
        id: tx.id,
        transaction_number: tx.transaction_number,
        type: tx.type,
        status: tx.status,
        transaction_date: tx.transaction_date,
        items_count: tx.items_count ?? tx.items?.length ?? 0,
        created_by: tx.created_by.name,
        created_at: tx.created_at,
      })
    );

    return { stats, recentTransactions, criticalItems };
  },
};
