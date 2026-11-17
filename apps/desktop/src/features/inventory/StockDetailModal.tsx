import React, { useState, useEffect } from 'react';
import { StockTransaction } from './types';
import { stockTransactionService } from './stockTransactionService';

interface StockDetailModalProps {
  transactionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (msg: string) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  transactionId,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && transactionId) {
      setIsLoading(true);
      setErrorMessage(null);
      stockTransactionService
        .getTransactionDetail(transactionId)
        .then((res) => {
          setTransaction(res.transaction);
        })
        .catch((err) => {
          setErrorMessage(err.message || 'Gagal memuat detail transaksi.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setTransaction(null);
    }
  }, [isOpen, transactionId]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!transaction) return;
    if (!window.confirm(`Konfirmasi transaksi ${transaction.transaction_number}? Stok barang akan diperbarui.`)) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await stockTransactionService.confirmTransaction(transaction.id);
      onStatusUpdated(res.message || 'Transaksi berhasil dikonfirmasi.');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengonfirmasi transaksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!transaction) return;
    if (!window.confirm(`Batalkan transaksi ${transaction.transaction_number}?`)) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await stockTransactionService.cancelTransaction(transaction.id);
      onStatusUpdated(res.message || 'Transaksi berhasil dibatalkan.');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membatalkan transaksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStockIn = transaction?.type === 'stock_in';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            Detail Transaksi: {transaction?.transaction_number || 'Memuat...'}
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="modal-error-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading || !transaction ? (
          <div className="loading-spinner">
            <span className="spinner" style={{ borderColor: '#94a3b8', borderTopColor: '#2563eb' }} />
            <span>Memuat rincian transaksi...</span>
          </div>
        ) : (
          <div>
            {/* Metadata Grid */}
            <div className="detail-grid">
              <div>
                <span className="detail-label">Jenis Transaksi:</span>{' '}
                <span className={`badge-type ${isStockIn ? 'badge-in' : 'badge-out'}`}>
                  {isStockIn ? 'Barang Masuk' : 'Barang Keluar'}
                </span>
              </div>
              <div>
                <span className="detail-label">Status:</span>{' '}
                <span className={`badge-status-${transaction.status}`}>
                  {transaction.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="detail-label">Tanggal Transaksi:</span>{' '}
                <span className="detail-val">{transaction.transaction_date}</span>
              </div>
              <div>
                <span className="detail-label">Dibuat Oleh:</span>{' '}
                <span className="detail-val">{transaction.created_by?.name || '-'}</span>
              </div>
              {transaction.confirmed_by && (
                <div>
                  <span className="detail-label">Dikonfirmasi Oleh:</span>{' '}
                  <span className="detail-val">{transaction.confirmed_by.name}</span>
                </div>
              )}
              {transaction.confirmed_at && (
                <div>
                  <span className="detail-label">Waktu Konfirmasi:</span>{' '}
                  <span className="detail-val">{new Date(transaction.confirmed_at).toLocaleString('id-ID')}</span>
                </div>
              )}
              {transaction.note && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Catatan:</span>{' '}
                  <span className="detail-val">{transaction.note}</span>
                </div>
              )}
              {transaction.reason && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Keperluan / Proyek:</span>{' '}
                  <span className="detail-val">{transaction.reason}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.95rem', color: '#0f172a' }}>
              Material yang Ditransaksikan ({transaction.items?.length || 0} Barang)
            </h4>

            <div className="table-card" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Jumlah</th>
                    {isStockIn && <th>Harga Beli</th>}
                    {isStockIn && <th>Total Nilai</th>}
                    <th>Stok Sebelum</th>
                    <th>Stok Sesudah</th>
                  </tr>
                </thead>
                <tbody>
                  {(transaction.items || []).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{item.product?.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                          {item.product?.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: isStockIn ? '#16a34a' : '#ea580c' }}>
                        {isStockIn ? '+' : '-'}{Math.abs(Number(item.quantity))} {item.product?.unit}
                      </td>
                      {isStockIn && (
                        <td>
                          {item.purchase_price
                            ? `Rp ${Number(item.purchase_price).toLocaleString('id-ID')}`
                            : '-'}
                        </td>
                      )}
                      {isStockIn && (
                        <td style={{ fontWeight: 600 }}>
                          {item.total_purchase
                            ? `Rp ${Number(item.total_purchase).toLocaleString('id-ID')}`
                            : '-'}
                        </td>
                      )}
                      <td style={{ color: '#64748b' }}>{item.stock_before}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.stock_after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={isProcessing}>
                Tutup
              </button>

              {transaction.status === 'draft' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-icon-action btn-icon-danger"
                    style={{ padding: '0.6rem 1rem' }}
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    Batalkan Transaksi
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ background: '#16a34a' }}
                    onClick={handleConfirm}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Mengonfirmasi...' : 'Konfirmasi Transaksi (Ubah Stok)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
