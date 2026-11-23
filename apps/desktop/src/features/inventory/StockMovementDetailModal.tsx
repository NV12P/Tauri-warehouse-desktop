import React, { useState, useEffect } from 'react';
import { StockMovement } from './types';
import { stockMovementService } from './stockMovementService';
import { getErrorMessage } from '../../services/apiClient';

interface StockMovementDetailModalProps {
  movementId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const MOVEMENT_LABELS: Record<string, string> = {
  stock_in: 'Barang Masuk',
  stock_out: 'Barang Keluar',
  stock_opname: 'Stock Opname',
  correction: 'Koreksi Stok',
};

export const StockMovementDetailModal: React.FC<StockMovementDetailModalProps> = ({
  movementId,
  isOpen,
  onClose,
}) => {
  const [movement, setMovement] = useState<StockMovement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !movementId) {
      setMovement(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setErrorMessage(null);

    stockMovementService
      .getMovement(movementId)
      .then((res) => {
        if (!cancelled) setMovement(res.movement);
      })
      .catch((err) => {
        if (!cancelled) setErrorMessage(getErrorMessage(err, 'Gagal memuat detail pergerakan stok.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, movementId]);

  if (!isOpen) return null;

  const signedQuantity = movement ? Number(movement.quantity) : 0;
  const isPositive = signedQuantity >= 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            Detail Pergerakan #{movementId ?? '-'}
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

        {isLoading || !movement ? (
          <div className="loading-spinner">
            <span className="spinner" style={{ borderColor: '#94a3b8', borderTopColor: '#2563eb' }} />
            <span>Memuat detail pergerakan stok...</span>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', background: '#ffffff', overflowY: 'auto' }}>
            <div className="detail-grid">
              <div style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Material:</span>{' '}
                <span className="detail-val">
                  {movement.product?.name || '-'} ({movement.product?.code || '-'})
                </span>
              </div>
              <div>
                <span className="detail-label">Jenis Pergerakan:</span>{' '}
                <span className={`badge-type ${isPositive ? 'badge-in' : 'badge-out'}`}>
                  {MOVEMENT_LABELS[movement.movement_type] || movement.movement_type}
                </span>
              </div>
              <div>
                <span className="detail-label">Dicatat Oleh:</span>{' '}
                <span className="detail-val">{movement.performed_by?.name || '-'}</span>
              </div>
              <div>
                <span className="detail-label">Stok Sebelum:</span>{' '}
                <span className="detail-val">{movement.stock_before} {movement.product?.unit || ''}</span>
              </div>
              <div>
                <span className="detail-label">Perubahan:</span>{' '}
                <span style={{ fontWeight: 700, color: isPositive ? '#16a34a' : '#ea580c' }}>
                  {isPositive ? '+' : ''}{signedQuantity} {movement.product?.unit || ''}
                </span>
              </div>
              <div>
                <span className="detail-label">Stok Sesudah:</span>{' '}
                <span className="detail-val">{movement.stock_after} {movement.product?.unit || ''}</span>
              </div>
              <div>
                <span className="detail-label">Waktu Pencatatan:</span>{' '}
                <span className="detail-val">{new Date(movement.created_at).toLocaleString('id-ID')}</span>
              </div>
              {movement.reason && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Alasan:</span>{' '}
                  <span className="detail-val">{movement.reason}</span>
                </div>
              )}
              {movement.source && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Sumber:</span>{' '}
                  <span className="detail-val">
                    {movement.source.transaction_number
                      ? `${movement.source.type} · ${movement.source.transaction_number}`
                      : `${movement.source.type} #${movement.source.id}`}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn-cancel" onClick={onClose}>
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
