import React, { useEffect, useState, useCallback } from 'react';
import { User } from '../auth/types';
import { dashboardService } from './dashboardService';
import type { DashboardData, LoadingState } from './types';
import './dashboard.css';

interface DashboardOverviewProps {
  user: User;
  onNavigateToCategories: () => void;
  onNavigateToItems: () => void;
  onNavigateToTransactions: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function getTxTypeLabel(type: string): string {
  const map: Record<string, string> = {
    stock_in: 'Barang Masuk',
    stock_out: 'Barang Keluar',
    correction: 'Koreksi',
    stock_opname: 'Opname',
  };
  return map[type] ?? type;
}

function getTxTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    stock_in: 'badge-stock-in',
    stock_out: 'badge-stock-out',
    correction: 'badge-correction',
    stock_opname: 'badge-opname',
  };
  return map[type] ?? 'badge-default';
}

function getTxStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'badge-confirmed',
    draft: 'badge-draft',
    cancelled: 'badge-cancelled',
  };
  return map[status] ?? 'badge-default';
}

function getTxStatusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'Dikonfirmasi',
    draft: 'Draft',
    cancelled: 'Dibatalkan',
  };
  return map[status] ?? status;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
  sub?: string;
  onClick?: () => void;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  colorClass,
  sub,
  onClick,
  loading,
}) => (
  <div
    className={`stat-card ${colorClass}${onClick ? ' stat-card-clickable' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-body">
      <span className="stat-card-label">{label}</span>
      {loading ? (
        <div className="stat-skeleton" />
      ) : (
        <strong className="stat-card-value">{value}</strong>
      )}
      {sub && !loading && <span className="stat-card-sub">{sub}</span>}
    </div>
  </div>
);

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

const SkeletonRows: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 4,
  cols = 4,
}) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="skeleton-row">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j}>
            <div
              className="skeleton-cell"
              style={{
                width: j === 0 ? '75%' : j === cols - 1 ? '45%' : '65%',
              }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  onNavigateToCategories,
  onNavigateToItems,
  onNavigateToTransactions,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoadingState('loading');
    setErrorMsg(null);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
      setLoadingState('success');
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memuat data dashboard. Pastikan server API berjalan.';
      setErrorMsg(msg);
      setLoadingState('error');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isLoading = loadingState === 'loading';
  const stats = data?.stats;

  return (
    <div className="dashboard-container">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {getGreeting()}, {user.name || user.username}!
          </h1>
          <p className="dashboard-subtitle">
            Ringkasan operasional gudang &mdash;{' '}
            {formatDate(new Date().toISOString())}
          </p>
        </div>
        <div className="dashboard-header-actions">
          {lastRefreshed && (
            <span className="dashboard-last-refresh">
              Diperbarui: {formatDateTime(lastRefreshed.toISOString())}
            </span>
          )}
          <button
            type="button"
            className="btn-refresh"
            onClick={fetchData}
            disabled={isLoading}
            title="Muat ulang data"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={isLoading ? 'spin' : ''}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            {isLoading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {loadingState === 'error' && (
        <div className="dashboard-error-banner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMsg}</span>
          <button type="button" onClick={fetchData} className="error-retry-btn">
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Stat Cards: Inventaris ── */}
      <section className="dashboard-section">
        <h2 className="section-title">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
            <path d="M6 18h12" />
            <path d="M6 14h12" />
            <rect width="6" height="6" x="9" y="10" />
          </svg>
          Inventaris
        </h2>
        <div className="stat-grid">
          <StatCard
            label="Total Kategori"
            value={stats?.totalCategories ?? 0}
            sub={`${stats?.activeCategories ?? 0} aktif`}
            loading={isLoading}
            colorClass="card-blue"
            onClick={onNavigateToCategories}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              </svg>
            }
          />
          <StatCard
            label="Total Barang Aktif"
            value={stats?.activeItems ?? 0}
            sub="item terdaftar"
            loading={isLoading}
            colorClass="card-indigo"
            onClick={onNavigateToItems}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            }
          />
          <StatCard
            label="Stok Menipis"
            value={stats?.lowStockItems ?? 0}
            sub="perlu restock segera"
            loading={isLoading}
            colorClass={stats?.lowStockItems ? 'card-amber' : 'card-green'}
            onClick={onNavigateToItems}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
          />
          <StatCard
            label="Stok Habis"
            value={stats?.outOfStockItems ?? 0}
            sub="perlu pengadaan"
            loading={isLoading}
            colorClass={stats?.outOfStockItems ? 'card-red' : 'card-green'}
            onClick={onNavigateToItems}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Stat Cards: Transaksi ── */}
      <section className="dashboard-section">
        <h2 className="section-title">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m16 3 4 4-4 4" />
            <path d="M20 7H4" />
            <path d="m8 21-4-4 4-4" />
            <path d="M4 17h16" />
          </svg>
          Transaksi
        </h2>
        <div className="stat-grid">
          <StatCard
            label="Total Transaksi"
            value={stats?.todayTransactions ?? 0}
            sub="semua waktu"
            loading={isLoading}
            colorClass="card-teal"
            onClick={onNavigateToTransactions}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
          />
          <StatCard
            label="Barang Masuk"
            value={stats?.totalStockIn ?? 0}
            sub="dikonfirmasi"
            loading={isLoading}
            colorClass="card-green"
            onClick={onNavigateToTransactions}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            }
          />
          <StatCard
            label="Barang Keluar"
            value={stats?.totalStockOut ?? 0}
            sub="dikonfirmasi"
            loading={isLoading}
            colorClass="card-orange"
            onClick={onNavigateToTransactions}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            }
          />
          <StatCard
            label="Menunggu Konfirmasi"
            value={stats?.pendingTransactions ?? 0}
            sub="transaksi draft"
            loading={isLoading}
            colorClass={stats?.pendingTransactions ? 'card-amber' : 'card-teal'}
            onClick={onNavigateToTransactions}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Bottom Grid: Transaksi Terbaru + Peringatan Stok ── */}
      <div className="dashboard-bottom-grid">
        {/* Transaksi Terbaru */}
        <section className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Transaksi Terbaru
            </h3>
            <button
              type="button"
              className="panel-link"
              onClick={onNavigateToTransactions}
            >
              Lihat Semua &rarr;
            </button>
          </div>
          <div className="panel-table-wrapper">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th className="col-tx-user">Oleh</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows rows={5} cols={5} />
                ) : data?.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      <div className="table-empty-inner">
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="1.5"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>Belum ada transaksi</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="tx-number">{tx.transaction_number}</td>
                      <td>
                        <span
                          className={`badge ${getTxTypeBadgeClass(tx.type)}`}
                        >
                          {getTxTypeLabel(tx.type)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getTxStatusBadgeClass(
                            tx.status
                          )}`}
                        >
                          {getTxStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="tx-date">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="tx-user col-tx-user">{tx.created_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Peringatan Stok */}
        <section className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Peringatan Stok
            </h3>
            <button
              type="button"
              className="panel-link"
              onClick={onNavigateToItems}
            >
              Lihat Semua &rarr;
            </button>
          </div>
          <div className="panel-table-wrapper">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th className="col-item-category">Kategori</th>
                  <th>Stok</th>
                  <th>Min</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows rows={4} cols={5} />
                ) : data?.criticalItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty table-empty-good">
                      <div className="table-empty-inner">
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Semua stok aman</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.criticalItems.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        item.status === 'out_of_stock'
                          ? 'row-critical'
                          : 'row-warning'
                      }
                    >
                      <td>
                        <div className="item-name-cell">
                          <span className="item-name">{item.name}</span>
                          <span className="item-code">{item.code}</span>
                        </div>
                      </td>
                      <td className="item-category col-item-category">
                        {item.category}
                      </td>
                      <td>
                        <span
                          className={`stock-value ${
                            item.status === 'out_of_stock'
                              ? 'stock-zero'
                              : 'stock-low'
                          }`}
                        >
                          {item.current_stock} {item.unit}
                        </span>
                      </td>
                      <td className="stock-min-val">
                        {item.min_stock} {item.unit}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === 'out_of_stock'
                              ? 'badge-out-of-stock'
                              : 'badge-low-stock'
                          }`}
                        >
                          {item.status === 'out_of_stock' ? 'Habis' : 'Menipis'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Akses Cepat ── */}
      <section className="dashboard-section">
        <h2 className="section-title">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          Akses Cepat
        </h2>
        <div className="quick-nav-grid">
          <button
            type="button"
            className="quick-nav-card"
            onClick={onNavigateToCategories}
          >
            <div className="quick-nav-icon qn-blue">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              </svg>
            </div>
            <div className="quick-nav-text">
              <strong>Master Kategori</strong>
              <span>Kelola kategori material</span>
            </div>
            <svg
              className="quick-nav-arrow"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button
            type="button"
            className="quick-nav-card"
            onClick={onNavigateToItems}
          >
            <div className="quick-nav-icon qn-indigo">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <div className="quick-nav-text">
              <strong>Data Barang</strong>
              <span>Kelola katalog material</span>
            </div>
            <svg
              className="quick-nav-arrow"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button
            type="button"
            className="quick-nav-card"
            onClick={onNavigateToTransactions}
          >
            <div className="quick-nav-icon qn-teal">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m16 3 4 4-4 4" />
                <path d="M20 7H4" />
                <path d="m8 21-4-4 4-4" />
                <path d="M4 17h16" />
              </svg>
            </div>
            <div className="quick-nav-text">
              <strong>Transaksi Stok</strong>
              <span>Catat masuk &amp; keluar barang</span>
            </div>
            <svg
              className="quick-nav-arrow"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};
