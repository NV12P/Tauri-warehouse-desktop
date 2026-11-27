import React, { useState, useEffect, useCallback } from 'react';
import { Item } from '../master-data/items/types';
import { itemService } from '../master-data/items/itemService';
import { getErrorMessage } from '../../services/apiClient';
import { stockMovementService } from './stockMovementService';
import { StockMovement, StockMovementListResponse, MovementType } from './types';
import { StockMovementDetailModal } from './StockMovementDetailModal';
import { LoadingState } from '../../components/ui/LoadingState';
import './transactions.css';
import './movements.css';

type TypeFilter = 'all' | MovementType;

const MOVEMENT_LABELS: Record<MovementType, string> = {
  stock_in: 'Barang Masuk',
  stock_out: 'Barang Keluar',
  stock_opname: 'Stock Opname',
  correction: 'Koreksi Stok',
};

export const StockMovementPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [meta, setMeta] = useState<StockMovementListResponse['meta']>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<Item[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [productFilter, setProductFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [selectedMovementId, setSelectedMovementId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    itemService
      .getItems({ per_page: 100 })
      .then((res) => setProducts(res.data || []))
      .catch(() => {
        // Daftar material hanya filter opsional; kegagalan tidak menghentikan halaman.
      });
  }, []);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await stockMovementService.getMovements({
        movement_type: typeFilter === 'all' ? undefined : typeFilter,
        product_id: productFilter ? Number(productFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: 20,
        page,
      });
      setMovements(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal memuat riwayat pergerakan stok.'));
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, productFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const resetPageAnd = (update: () => void) => {
    setPage(1);
    update();
  };

  const getTypeBadge = (type: MovementType) => {
    const variant = type === 'stock_in' ? 'badge-in' : type === 'stock_out' ? 'badge-out' : 'badge-correction';
    return <span className={`badge-type ${variant}`}>{MOVEMENT_LABELS[type] || type}</span>;
  };

  const formatQuantity = (movement: StockMovement) => {
    const value = Number(movement.quantity);
    return {
      text: `${value > 0 ? '+' : ''}${value} ${movement.product?.unit || ''}`,
      positive: value >= 0,
    };
  };

  return (
    <div className="transactions-page">
      <div className="trx-header">
        <div>
          <h1 className="page-title">Riwayat Pergerakan Stok</h1>
          <p className="page-subtitle">
            Catatan audit setiap perubahan stok material, termasuk barang masuk, keluar, koreksi, dan opname
          </p>
        </div>
        <button type="button" className="btn-icon-action" onClick={fetchMovements} title="Muat ulang riwayat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {errorMessage && (
        <div className="alert-banner" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
          <span>{errorMessage}</span>
          <button type="button" className="alert-close" onClick={() => setErrorMessage(null)}>
            &times;
          </button>
        </div>
      )}

      <div className="trx-filter-bar">
        <div className="trx-filter-group">
          <select
            className="items-select"
            value={typeFilter}
            onChange={(e) => resetPageAnd(() => setTypeFilter(e.target.value as TypeFilter))}
          >
            <option value="all">Semua Jenis Pergerakan</option>
            <option value="stock_in">Barang Masuk</option>
            <option value="stock_out">Barang Keluar</option>
            <option value="correction">Koreksi Stok</option>
            <option value="stock_opname">Stock Opname</option>
          </select>

          <select
            className="items-select"
            value={productFilter}
            onChange={(e) => resetPageAnd(() => setProductFilter(e.target.value))}
          >
            <option value="">Semua Material</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Dari:</span>
            <input
              type="date"
              className="date-input"
              value={dateFrom}
              onChange={(e) => resetPageAnd(() => setDateFrom(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Sampai:</span>
            <input
              type="date"
              className="date-input"
              value={dateTo}
              onChange={(e) => resetPageAnd(() => setDateTo(e.target.value))}
            />
          </div>

          {(dateFrom || dateTo || productFilter || typeFilter !== 'all') && (
            <button
              type="button"
              className="btn-icon-action"
              onClick={() => {
                setPage(1);
                setTypeFilter('all');
                setProductFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        {isLoading ? (
          <LoadingState message="Memuat riwayat pergerakan stok..." />
        ) : movements.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <path d="M3 12h18" />
              <path d="m16 3 4 4-4 4" />
              <path d="M21 7H3" />
              <path d="m8 21-4-4 4-4" />
              <path d="M21 17H3" />
            </svg>
            <p style={{ margin: 0, fontWeight: 500 }}>Belum ada pergerakan stok tercatat.</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#475569' }}>
              Pergerakan muncul setelah transaksi dikonfirmasi atau koreksi/opname dibuat.
            </p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Waktu</th>
                  <th>Material</th>
                  <th style={{ width: '140px' }}>Jenis</th>
                  <th style={{ width: '120px' }}>Perubahan</th>
                  <th style={{ width: '190px' }}>Stok Sebelum → Sesudah</th>
                  <th>Alasan / Sumber</th>
                  <th style={{ width: '130px' }}>Dicatat Oleh</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => {
                  const qty = formatQuantity(movement);
                  return (
                    <tr key={movement.id}>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {new Date(movement.created_at).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {movement.product?.name || '-'}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                          {movement.product?.code || '-'}
                        </span>
                      </td>
                      <td>{getTypeBadge(movement.movement_type)}</td>
                      <td>
                        <span
                          className="movement-quantity"
                          style={{ color: qty.positive ? '#16a34a' : '#ea580c' }}
                        >
                          {qty.text}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{movement.stock_before}</span>
                        <span style={{ margin: '0 0.35rem', color: '#64748b' }}>→</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {movement.stock_after}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 500 }}>
                          {movement.reason || <span style={{ color: '#64748b', fontStyle: 'italic' }}>-</span>}
                        </span>
                        {movement.source?.transaction_number && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#2563eb', fontFamily: 'monospace' }}>
                            {movement.source.transaction_number}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                          {movement.performed_by?.name || '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon-action"
                          onClick={() => {
                            setSelectedMovementId(movement.id);
                            setIsDetailOpen(true);
                          }}
                          title="Lihat detail pergerakan"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="movement-pagination">
              <span>
                {meta
                  ? `Menampilkan ${meta.from ?? 0}–${meta.to ?? 0} dari ${meta.total} pergerakan`
                  : `Menampilkan ${movements.length} pergerakan`}
              </span>
              <div className="movement-pagination__actions">
                <button
                  type="button"
                  className="btn-icon-action"
                  disabled={!meta || meta.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </button>
                <span>
                  Halaman {meta?.current_page ?? 1} / {meta?.last_page ?? 1}
                </span>
                <button
                  type="button"
                  className="btn-icon-action"
                  disabled={!meta || meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <StockMovementDetailModal
        movementId={selectedMovementId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
