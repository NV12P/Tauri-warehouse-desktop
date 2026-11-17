import React, { useState, useEffect } from 'react';
import { Item, ItemInput } from './types';
import { itemService } from './itemService';
import { categoryService } from '../categories/categoryService';
import { Category } from '../categories/types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  itemToEdit: Item | null;
}

const COMMON_UNITS = [
  'Sak',
  'Batang',
  'Pcs',
  'Kg',
  'Dus',
  'Lembar',
  'M3',
  'Roll',
  'Meter',
  'Liter',
  'Kaleng',
  'Box',
  'Ton',
];

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  itemToEdit,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [unit, setUnit] = useState('Sak');
  const [customUnit, setCustomUnit] = useState('');
  const [code, setCode] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [minStock, setMinStock] = useState<string>('0');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCategories(true);
      categoryService
        .getCategories({ is_active: true, per_page: 100 })
        .then((res) => {
          setCategories(res.data || []);
          if (!itemToEdit && res.data && res.data.length > 0 && categoryId === '') {
            setCategoryId(res.data[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingCategories(false));
    }
  }, [isOpen, itemToEdit]);

  // Set fields on edit
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategoryId(itemToEdit.category?.id || '');
      if (COMMON_UNITS.includes(itemToEdit.unit)) {
        setUnit(itemToEdit.unit);
        setCustomUnit('');
      } else {
        setUnit('custom');
        setCustomUnit(itemToEdit.unit);
      }
      setCode(itemToEdit.code || '');
      setBrand(itemToEdit.brand || '');
      setBarcode(itemToEdit.barcode || '');
      setPurchasePrice(itemToEdit.purchase_price !== null ? String(itemToEdit.purchase_price) : '');
      setSellingPrice(itemToEdit.selling_price !== null ? String(itemToEdit.selling_price) : '');
      setMinStock(String(itemToEdit.min_stock ?? 0));
      setIsActive(Boolean(itemToEdit.is_active));
    } else {
      setName('');
      setUnit('Sak');
      setCustomUnit('');
      setCode('');
      setBrand('');
      setBarcode('');
      setPurchasePrice('');
      setSellingPrice('');
      setMinStock('0');
      setIsActive(true);
    }
    setErrorMessage(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama barang wajib diisi.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Kategori wajib dipilih.');
      return;
    }

    const finalUnit = unit === 'custom' ? customUnit.trim() : unit;
    if (!finalUnit) {
      setErrorMessage('Satuan material wajib ditentukan.');
      return;
    }

    const payload: ItemInput = {
      name: name.trim(),
      category_id: Number(categoryId),
      unit: finalUnit,
      code: code.trim() ? code.trim() : undefined,
      brand: brand.trim() ? brand.trim() : undefined,
      barcode: barcode.trim() ? barcode.trim() : undefined,
      purchase_price: purchasePrice !== '' ? Number(purchasePrice) : undefined,
      selling_price: sellingPrice !== '' ? Number(sellingPrice) : undefined,
      min_stock: minStock !== '' ? Number(minStock) : 0,
      is_active: isActive,
    };

    setIsLoading(true);
    try {
      if (itemToEdit) {
        const res = await itemService.updateItem(itemToEdit.id, payload);
        onSuccess(res.message || 'Data barang berhasil diperbarui.');
      } else {
        const res = await itemService.createItem(payload);
        onSuccess(res.message || 'Barang berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data barang.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {itemToEdit ? `Edit Barang: ${itemToEdit.name}` : 'Tambah Barang Baru'}
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

        <form onSubmit={handleSubmit}>
          {/* Nama Barang & Kategori */}
          <div className="form-group">
            <label className="form-label" htmlFor="item-name">
              Nama Barang / Material <span className="required">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              className="form-input"
              placeholder="Contoh: Semen Gresik 50kg, Besi Ulir 10mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={255}
              autoFocus
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="item-category">
                Kategori <span className="required">*</span>
              </label>
              <select
                id="item-category"
                className="form-input"
                style={{ padding: '0.65rem 0.75rem' }}
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                disabled={isLoading || isLoadingCategories}
              >
                {categories.length === 0 ? (
                  <option value="">Belum ada kategori aktif</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-unit">
                Satuan Material <span className="required">*</span>
              </label>
              <select
                id="item-unit"
                className="form-input"
                style={{ padding: '0.65rem 0.75rem' }}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={isLoading}
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="custom">Lainnya (Tulis Sendiri)</option>
              </select>
            </div>
          </div>

          {unit === 'custom' && (
            <div className="form-group">
              <label className="form-label" htmlFor="custom-unit">
                Tulis Satuan Kustom <span className="required">*</span>
              </label>
              <input
                id="custom-unit"
                type="text"
                className="form-input"
                placeholder="Contoh: Perkodi, Set, Pack"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Kode Barang & Brand */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="item-code">
                Kode Barang / SKU <span style={{ color: '#64748b', fontWeight: 400 }}>(Opsional)</span>
              </label>
              <input
                id="item-code"
                type="text"
                className="form-input"
                placeholder={itemToEdit ? 'Kode barang' : 'Otomatis dibuat jika kosong'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-brand">
                Merk / Brand <span style={{ color: '#64748b', fontWeight: 400 }}>(Opsional)</span>
              </label>
              <input
                id="item-brand"
                type="text"
                className="form-input"
                placeholder="Contoh: Semen Gresik, Holcim"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={isLoading}
                maxLength={100}
              />
            </div>
          </div>

          {/* Harga Beli & Harga Jual */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="purchase-price">
                Harga Beli / Modal (Rp)
              </label>
              <input
                id="purchase-price"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="Contoh: 65000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="selling-price">
                Harga Jual (Rp)
              </label>
              <input
                id="selling-price"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="Contoh: 72000"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Stok Minimum & Barcode */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="min-stock">
                Stok Minimum (Batas Peringatan)
              </label>
              <input
                id="min-stock"
                type="number"
                step="0.001"
                min="0"
                className="form-input"
                placeholder="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-barcode">
                Barcode / EAN <span style={{ color: '#64748b', fontWeight: 400 }}>(Opsional)</span>
              </label>
              <input
                id="item-barcode"
                type="text"
                className="form-input"
                placeholder="Scan / ketik barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={isLoading}
                maxLength={100}
              />
            </div>
          </div>

          {/* Checkbox Status Aktif */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isLoading}
              />
              <span>Material Aktif</span>
            </label>
            <span className="checkbox-hint">Barang nonaktif tidak akan muncul di daftar transaksi baru & kasir</span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : itemToEdit ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
