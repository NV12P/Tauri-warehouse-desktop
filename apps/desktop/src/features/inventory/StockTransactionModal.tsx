import React, { useState, useEffect } from 'react';
import { Item } from '../master-data/items/types';
import { itemService } from '../master-data/items/itemService';
import { stockTransactionService } from './stockTransactionService';
import { CreateStockInInput, CreateStockOutInput } from './types';

interface StockTransactionModalProps {
  isOpen: boolean;
  type: 'stock_in' | 'stock_out';
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface FormItemRow {
  productId: number;
  quantity: number;
  purchasePrice: number;
}

export const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  type,
  onClose,
  onSuccess,
}) => {
  const [products, setProducts] = useState<Item[]>([]);
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [rows, setRows] = useState<FormItemRow[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      itemService
        .getItems({ is_active: true, per_page: 100 })
        .then((res) => {
          const list = res.data || [];
          setProducts(list);
          if (list.length > 0) {
            setRows([
              {
                productId: list[0].id,
                quantity: 1,
                purchasePrice: Number(list[0].purchase_price || 0),
              },
            ]);
          }
        })
        .catch(() => {});

      setTransactionDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setReason('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    if (products.length === 0) return;
    setRows([
      ...rows,
      {
        productId: products[0].id,
        quantity: 1,
        purchasePrice: Number(products[0].purchase_price || 0),
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof FormItemRow, value: number) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };

    // When product changes, auto-fill purchase price
    if (field === 'productId') {
      const selected = products.find((p) => p.id === value);
      if (selected) {
        updated[index].purchasePrice = Number(selected.purchase_price || 0);
      }
    }
    setRows(updated);
  };

  const handleSubmit = async (directConfirm = false) => {
    setErrorMessage(null);

    if (rows.length === 0) {
      setErrorMessage('Harus menambahkan minimal 1 barang.');
      return;
    }

    // Validation
    for (const r of rows) {
      if (r.quantity <= 0) {
        setErrorMessage('Kuantitas setiap barang harus lebih dari 0.');
        return;
      }
      if (type === 'stock_out') {
        const prod = products.find((p) => p.id === r.productId);
        if (prod && Number(prod.current_stock) < r.quantity) {
          setErrorMessage(
            `Stok "${prod.name}" tidak mencukupi (Tersedia: ${prod.current_stock}, Diminta: ${r.quantity}).`
          );
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      let createdTrxId: number | null = null;
      let successMsg = '';

      if (type === 'stock_in') {
        const payload: CreateStockInInput = {
          transaction_date: transactionDate,
          note: note.trim() ? note.trim() : undefined,
          items: rows.map((r) => ({
            product_id: r.productId,
            quantity: Number(r.quantity),
            purchase_price: r.purchasePrice > 0 ? Number(r.purchasePrice) : undefined,
          })),
        };
        const res = await stockTransactionService.createStockIn(payload);
        createdTrxId = res.transaction?.id;
        successMsg = res.message || 'Transaksi barang masuk berhasil dibuat.';
      } else {
        const payload: CreateStockOutInput = {
          transaction_date: transactionDate,
          note: note.trim() ? note.trim() : undefined,
          reason: reason.trim() ? reason.trim() : undefined,
          items: rows.map((r) => ({
            product_id: r.productId,
            quantity: Number(r.quantity),
          })),
        };
        const res = await stockTransactionService.createStockOut(payload);
        createdTrxId = res.transaction?.id;
        successMsg = res.message || 'Transaksi barang keluar berhasil dibuat.';
      }

      // If user chose direct confirmation
      if (directConfirm && createdTrxId) {
        const confirmRes = await stockTransactionService.confirmTransaction(createdTrxId);
        successMsg = `${confirmRes.message} (Stok barang telah diperbarui secara riil).`;
      }

      onSuccess(successMsg);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan transaksi stok.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalEstimated = () => {
    return rows.reduce((acc, r) => acc + r.quantity * r.purchasePrice, 0);
  };

  const isStockIn = type === 'stock_in';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge-type ${isStockIn ? 'badge-in' : 'badge-out'}`}>
              {isStockIn ? 'Barang Masuk (In)' : 'Barang Keluar (Out)'}
            </span>
            <span>{isStockIn ? 'Penerimaan Material' : 'Pengeluaran Material'}</span>
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

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
          {/* Header Metadata */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="trx-date">
                Tanggal Transaksi <span className="required">*</span>
              </label>
              <input
                id="trx-date"
                type="date"
                className="form-input"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trx-note">
                Catatan / Supplier / Surat Jalan
              </label>
              <input
                id="trx-note"
                type="text"
                className="form-input"
                placeholder={isStockIn ? 'Contoh: Pengiriman dari PT Sumber Semen' : 'Contoh: Diambil mandor proyek'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {!isStockIn && (
            <div className="form-group">
              <label className="form-label" htmlFor="trx-reason">
                Keperluan / Nama Proyek Tujuan <span className="required">*</span>
              </label>
              <input
                id="trx-reason"
                type="text"
                className="form-input"
                placeholder="Contoh: Pengecoran Lantai 2 Proyek Ruko Permata"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Items Table */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Daftar Material Konstruksi <span className="required">*</span>
              </label>
              <button
                type="button"
                className="btn-add-item-row"
                onClick={handleAddRow}
                disabled={isLoading || products.length === 0}
              >
                + Tambah Baris Material
              </button>
            </div>

            <table className="items-entry-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Material / Barang</th>
                  <th style={{ width: '20%' }}>Kuantitas</th>
                  {isStockIn && <th style={{ width: '25%' }}>Harga Beli (Rp)</th>}
                  <th style={{ width: '10%', textAlign: 'center' }}>Hapus</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const selectedProduct = products.find((p) => p.id === row.productId);
                  return (
                    <tr key={index}>
                      <td>
                        <select
                          className="item-select"
                          value={row.productId}
                          onChange={(e) => handleRowChange(index, 'productId', Number(e.target.value))}
                          disabled={isLoading}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} - {p.name} (Stok: {p.current_stock} {p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            className="qty-input"
                            value={row.quantity}
                            onChange={(e) => handleRowChange(index, 'quantity', Number(e.target.value))}
                            disabled={isLoading}
                            required
                          />
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {selectedProduct?.unit || ''}
                          </span>
                        </div>
                      </td>
                      {isStockIn && (
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="form-input"
                            style={{ padding: '0.45rem 0.5rem', fontSize: '0.85rem' }}
                            value={row.purchasePrice}
                            onChange={(e) => handleRowChange(index, 'purchasePrice', Number(e.target.value))}
                            disabled={isLoading}
                          />
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-remove-row"
                          onClick={() => handleRemoveRow(index)}
                          disabled={isLoading || rows.length === 1}
                          title="Hapus baris ini"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {isStockIn && (
              <div className="total-summary-card">
                <span>
                  Total Baris Material: <strong>{rows.length} Item</strong>
                </span>
                <span>
                  Estimasi Total Nilai Pembelian: <strong>Rp {calculateTotalEstimated().toLocaleString('id-ID')}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </button>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="submit"
                className="btn-secondary"
                disabled={isLoading}
                title="Hanya membuat draft transaksi tanpa mengubah stok gudang"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
              </button>

              <button
                type="button"
                className="btn-primary"
                style={{ background: isStockIn ? '#16a34a' : '#ea580c' }}
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                title="Langsung simpan dan konfirmasi agar stok gudang bertambah/berkurang sekarang"
              >
                {isLoading ? 'Memproses...' : 'Simpan & Konfirmasi Stok'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
