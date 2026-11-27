import { stockMovementService } from '../inventory/stockMovementService';
import type { StockInChartPeriod, StockInChartPoint } from './types';

/** Batasan pengaman agar loop pagination tidak berjalan tanpa henti. */
const MAX_PAGES = 50;

function toYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mengambil pergerakan barang masuk dari API lalu diagregasi per hari di client.
 * Sumber: GET /stock-movements?movement_type=stock_in&date_from&date_to
 * (lihat api.md). Tidak ada data dummy.
 */
export const stockInChartService = {
  async getStockInSeries(period: StockInChartPeriod): Promise<StockInChartPoint[]> {
    const dayCount = period === 'week' ? 7 : 30;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (dayCount - 1));

    const dateFrom = toYmd(startDate);
    const dateTo = toYmd(today);
    const totals = new Map<string, number>();

    let page = 1;
    let lastPage = 1;

    do {
      const response = await stockMovementService.getMovements({
        movement_type: 'stock_in',
        date_from: dateFrom,
        date_to: dateTo,
        per_page: 100,
        page,
      });

      for (const movement of response.data) {
        // created_at dari Laravel berbentuk "YYYY-MM-DD HH:mm:ss".
        const day = movement.created_at.slice(0, 10);
        const quantity = Number(movement.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) continue;
        totals.set(day, (totals.get(day) ?? 0) + quantity);
      }

      lastPage = response.meta?.last_page ?? 1;
      page += 1;
    } while (page <= lastPage && page <= MAX_PAGES);

    const weekdayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
    const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
    });
    const fullDateFormatter = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const points: StockInChartPoint[] = [];
    for (let offset = 0; offset < dayCount; offset += 1) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + offset);
      const key = toYmd(day);
      points.push({
        date: key,
        label:
          period === 'week'
            ? weekdayFormatter.format(day)
            : shortDateFormatter.format(day),
        fullLabel: fullDateFormatter.format(day),
        quantity: totals.get(key) ?? 0,
      });
    }

    return points;
  },
};
