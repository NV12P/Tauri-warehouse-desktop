import React, { useState, useEffect, useCallback } from 'react';
import { StockTransaction } from './types';
import { stockTransactionService, GetTransactionsParams } from './stockTransactionService';
import { getErrorMessage } from '../../services/apiClient';
import { StockTransactionModal } from './StockTransactionModal';
import { StockDetailModal } from './StockDetailModal';
import './transactions.css';

export const StockTransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'stock_in' | 'stock_out'>('stock_in');
  const [editingTrx, setEditingTrx] = useState<StockTransaction | null>(null);
  const [selectedTrxId, setSelectedTrxId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: GetTransactionsParams = { per_page: 50 };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await stockTransactionService.getTransactions(params);
      setTransactions(res.data || []);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal memuat daftar transaksi.'));
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOpenCreate = (type: 'stock_in' | 'stock_out') => {
    setEditingTrx(null);
    setCreateType(type);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (trx: StockTransaction) => {
    setEditingTrx(trx);
    setCreateType(trx.type === 'stock_out' ? 'stock_out' : 'stock_in');
    setIsCreateModalOpen(true);
  };

  const handleOpenDetail = (id: number) => {
    setSelectedTrxId(id);
    setIsDetailModalOpen(true);
  };

  const handleQuickConfirm = async (trx: StockTransaction) => {
    if (!window.confirm(`Konfirmasi transaksi ${trx.transaction_number}? Stok material akan langsung diperbarui.`)) {
      return;
    }

    try {
      const res = await stockTransactionService.confirmTransaction(trx.id);
      setSuccessMessage(res.message || 'Transaksi berhasil dikonfirmasi.');
      fetchTransactions();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal mengonfirmasi transaksi.'));
    }
  };

  const handleModalSuccess = (msg: string) => {
    setSuccessMessage(msg);
    fetchTransactions();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'stock_in':
        return <span className="badge-type badge-in">Masuk (In)</span>;
      case 'stock_out':
        return <span className="badge-type badge-out">Keluar (Out)</span>;
      default:
        return <span className="badge-type badge-correction">{type}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge-status-confirmed">CONFIRMED</span>;
      case 'cancelled':
        return <span className="badge-status-cancelled">BATAL</span>;
      default:
        return <span className="badge-status-draft">DRAFT</span>;
    }
  };

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="trx-header">
        <div>
          <h1 className="page-title">Transaksi Stok Material</h1>
          <p className="page-subtitle">
            Pencatatan pergerakan barang masuk dari supplier dan barang keluar untuk pemakaian proyek
          </p>
        </div>
        <div className="trx-header-actions">
          <button type="button" className="btn-stock-in" onClick={() => handleOpenCreate('stock_in')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span>+ Barang Masuk (In)</span>
          </button>
          <button type="button" className="btn-stock-out" onClick={() => handleOpenCreate('stock_out')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            <span>- Barang Keluar (Out)</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert-banner alert-success">
          <span>{successMessage}</span>
          <button type="button" className="alert-close" onClick={() => setSuccessMessage(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="alert-banner" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
          <span>{errorMessage}</span>
          <button type="button" className="alert-close" onClick={() => setErrorMessage(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="trx-filter-bar">
        <div className="trx-filter-group">
          {/* Tipe Transaksi */}
          <select
            className="items-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Semua Jenis Transaksi</option>
            <option value="stock_in">Barang Masuk Saja</option>
            <option value="stock_out">Barang Keluar Saja</option>
          </select>

          {/* Status Transaksi */}
          <select
            className="items-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft Saja</option>
            <option value="confirmed">Confirmed (Selesai)</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {/* Date filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dari:</span>
            <input
              type="date"
              className="date-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sampai:</span>
            <input
              type="date"
              className="date-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              type="button"
              className="btn-icon-action"
              onClick={() => { setDateFrom(''); setDateTo(''); }}
            >
              Reset Tanggal
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-icon-action"
          onClick={fetchTransactions}
          title="Muat ulang data transaksi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-spinner">
            <span className="spinner" style={{ borderColor: '#94a3b8', borderTopColor: '#2563eb' }} />
            <span>Memuat data riwayat transaksi stok...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <path d="m16 3 4 4-4 4" />
              <path d="M20 7H4" />
              <path d="m8 21-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
            <p style={{ margin: 0, fontWeight: 500 }}>Belum ada transaksi stok tercatat.</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Gunakan tombol "+ Barang Masuk" atau "- Barang Keluar" di atas untuk memulai.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Nomor Transaksi</th>
                <th style={{ width: '130px' }}>Jenis</th>
                <th style={{ width: '110px' }}>Tanggal</th>
                <th>Catatan / Keterangan</th>
                <th style={{ width: '100px' }}>Jumlah Item</th>
                <th style={{ width: '130px' }}>Dibuat Oleh</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '240px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx) => (
                <tr key={trx.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {trx.transaction_number}
                    </span>
                  </td>
                  <td>{getTypeBadge(trx.type)}</td>
                  <td>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                      {trx.transaction_date}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#334155' }}>
                      {trx.note || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>-</span>}
                    </span>
                  </td>
                  <td>
                    <span className="product-count-badge">
                      {trx.items_count ?? (trx.items ? trx.items.length : 0)} Material
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {trx.created_by?.name || '-'}
                    </span>
                  </td>
                  <td>{getStatusBadge(trx.status)}</td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => handleOpenDetail(trx.id)}
                        title="Lihat rincian material transaksi"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>Detail</span>
                      </button>

                      {trx.status === 'draft' && (
                        <>
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => handleOpenEdit(trx)}
                            title="Ubah draft transaksi"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action"
                            style={{ borderColor: '#86efac', background: '#f0fdf4', color: '#15803d' }}
                            onClick={() => handleQuickConfirm(trx)}
                            title="Konfirmasi transaksi (stok langsung terupdate)"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Konfirmasi</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Buat / Ubah Transaksi */}
      <StockTransactionModal
        isOpen={isCreateModalOpen}
        type={createType}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
        transactionToEdit={editingTrx}
      />

      {/* Modal Detail Transaksi */}
      <StockDetailModal
        transactionId={selectedTrxId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusUpdated={handleModalSuccess}
      />
    </div>
  );
};
