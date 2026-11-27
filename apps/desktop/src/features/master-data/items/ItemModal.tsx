import React, { useState, useEffect, useRef } from 'react';
import { ApiError, getErrorMessage } from '../../../services/apiClient';
import { Item } from './types';
import { getItemPhotoUrl, itemService, ItemSaveInput } from './itemService';
import { compressItemPhoto, formatFileSize } from './imageCompressor';
import { categoryService } from '../categories/categoryService';
import { Category } from '../categories/types';
import { Spinner } from '../../../components/ui/Spinner';
import './modal.css';

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

const MAX_SOURCE_PHOTO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Drag-drop di beberapa WebView bisa mengirim file.type kosong. */
function resolvePhotoType(file: File): string {
  if (file.type) return file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return '';
}

/** Laravel mengembalikan 422 ini saat endpoint hapus foto dipanggil dua kali. */
function isMissingPhotoError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 422) return false;
  const message = error.message.toLowerCase();
  return message.includes('tidak memiliki foto') || message.includes('belum memiliki foto');
}

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhotoPath, setOriginalPhotoPath] = useState<string | null>(null);
  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const isBusy = isLoading || isCompressingPhoto;

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

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Set fields on edit
  useEffect(() => {
    const existingPhotoUrl = itemToEdit ? getItemPhotoUrl(itemToEdit) : null;

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

    const initialPhotoPath = itemToEdit?.photo_path || itemToEdit?.photo_url || null;

    setPhotoFile(null);
    setPhotoPreview(null);
    setOriginalPhotoPath(initialPhotoPath);
    setShouldDeletePhoto(false);
    setPhotoUrl(existingPhotoUrl);
    setPhotoError(null);
    setPhotoNote(null);
    setIsCompressingPhoto(false);
    setIsDraggingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrorMessage(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoFile = async (file: File | undefined) => {
    if (!file || isBusy) return;

    setPhotoError(null);
    setPhotoNote(null);
    if (!ACCEPTED_PHOTO_TYPES.includes(resolvePhotoType(file))) {
      setPhotoError('Format gambar harus JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > MAX_SOURCE_PHOTO_BYTES) {
      setPhotoError('Ukuran foto sumber maksimal 10 MB.');
      return;
    }

    setIsCompressingPhoto(true);
    setShouldDeletePhoto(false);
    try {
      const result = await compressItemPhoto(file);
      setPhotoFile(result.file);
      setPhotoPreview(result.previewUrl);
      setPhotoUrl(null);
      setPhotoNote(
        result.wasCompressed
          ? `Dikompres otomatis: ${formatFileSize(file.size)} → ${formatFileSize(result.file.size)}`
          : `Ukuran foto: ${formatFileSize(result.file.size)}`
      );
    } catch (err) {
      setPhotoError(getErrorMessage(err, 'Gagal memproses gambar.'));
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
    setShouldDeletePhoto(Boolean(originalPhotoPath));
    setPhotoError(null);
    setPhotoNote(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    void handlePhotoFile(e.dataTransfer.files?.[0]);
  };

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

    const payload: ItemSaveInput = {
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

    if (photoFile) {
      payload.photo = photoFile;
    }

    setIsLoading(true);
    try {
      if (itemToEdit) {
        const res = await itemService.updateItem(itemToEdit.id, payload);

        // Laravel menyediakan endpoint terpisah untuk menghapus file foto.
        if (shouldDeletePhoto) {
          try {
            await itemService.deleteItemPhoto(itemToEdit.id);
          } catch (photoError) {
            // Jika foto memang sudah kosong, anggap penghapusan berhasil.
            if (!isMissingPhotoError(photoError)) {
              throw new Error(
                `Data barang tersimpan, tetapi foto gagal dihapus: ${getErrorMessage(
                  photoError,
                  'coba lagi.'
                )}`
              );
            }
          }
        }

        onSuccess(res.message || 'Data barang berhasil diperbarui.');
      } else {
        const res = await itemService.createItem(payload);
        onSuccess(res.message || 'Barang berhasil ditambahkan.');
      }
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal menyimpan data barang.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
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
              disabled={isBusy}
              maxLength={255}
              autoFocus
            />
          </div>

          {/* Foto Material */}
          <div className="photo-upload-section">
            <div className="photo-upload-heading">
              <span className="form-label">Foto Material <span className="photo-optional">(Opsional)</span></span>
              <span className="photo-format-hint">JPG/PNG &middot; dikompres ke JPG &middot; sumber maks. 10 MB</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="photo-file-input"
              onChange={(e) => void handlePhotoFile(e.target.files?.[0])}
              disabled={isBusy}
            />

            <div
              className={[
                'photo-dropzone',
                isDraggingPhoto ? 'photo-dropzone--dragging' : '',
                photoPreview || photoUrl ? 'photo-dropzone--filled' : '',
              ].filter(Boolean).join(' ')}
              role="button"
              tabIndex={0}
              aria-label="Pilih atau ganti foto material"
              onClick={() => !isBusy && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (!isBusy && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isBusy) setIsDraggingPhoto(true);
              }}
              onDragLeave={() => setIsDraggingPhoto(false)}
              onDrop={handlePhotoDrop}
            >
              {photoPreview || photoUrl ? (
                <div className="photo-preview-wrap">
                  <img
                    src={photoPreview ?? photoUrl ?? ''}
                    alt="Pratinjau foto material"
                    className="photo-preview-img"
                    onError={() => {
                      if (!photoPreview && photoUrl) {
                        setPhotoUrl(null);
                        setPhotoError('Foto dari server tidak dapat dimuat. Silakan pilih ulang foto.');
                      }
                    }}
                  />
                  <div className="photo-preview-overlay">
                    <span className="photo-preview-label">
                      {isCompressingPhoto ? (
                        <>
                          <Spinner />
                          <span>Mengompres gambar...</span>
                        </>
                      ) : photoFile ? (
                        `Gambar baru · ${formatFileSize(photoFile.size)}`
                      ) : (
                        'Foto saat ini'
                      )}
                    </span>
                    <div className="photo-actions">
                      <button
                        type="button"
                        className="photo-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isBusy) fileInputRef.current?.click();
                        }}
                        disabled={isBusy}
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        className="photo-action-btn photo-action-btn--danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto();
                        }}
                        disabled={isBusy}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="photo-upload-empty">
                  <span className="photo-upload-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14.5 4h-5L7.8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.8L14.5 4Z" />
                      <circle cx="12" cy="13.5" r="3.5" />
                    </svg>
                  </span>
                  <span className="photo-upload-title">Klik untuk pilih foto, atau tarik gambar ke sini</span>
                  <span className="photo-upload-subtitle">Gambar yang jelas membantu material lebih mudah dikenali</span>
                </div>
              )}
            </div>

            {photoNote && <div className="photo-note">{photoNote}</div>}
            {photoError && <div className="photo-error">{photoError}</div>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="item-category">
                Kategori <span className="required">*</span>
                {isLoadingCategories && (
                  <Spinner label="Memuat daftar kategori" className="form-label-spinner" />
                )}
              </label>
              <select
                id="item-category"
                className="form-input"
                style={{ padding: '0.65rem 0.75rem' }}
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                disabled={isBusy || isLoadingCategories}
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
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </div>
          )}

          {/* Kode Barang & Brand */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="item-code">
                Kode Barang / SKU <span style={{ color: '#475569', fontWeight: 500 }}>(Opsional)</span>
              </label>
              <input
                id="item-code"
                type="text"
                className="form-input"
                placeholder={itemToEdit ? 'Kode barang' : 'Otomatis dibuat jika kosong'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isBusy}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-brand">
                Merk / Brand <span style={{ color: '#475569', fontWeight: 500 }}>(Opsional)</span>
              </label>
              <input
                id="item-brand"
                type="text"
                className="form-input"
                placeholder="Contoh: Semen Gresik, Holcim"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={isBusy}
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
                disabled={isBusy}
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
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-barcode">
                Barcode / EAN <span style={{ color: '#475569', fontWeight: 500 }}>(Opsional)</span>
              </label>
              <input
                id="item-barcode"
                type="text"
                className="form-input"
                placeholder="Scan / ketik barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={isBusy}
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
                disabled={isBusy}
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
              disabled={isBusy}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isBusy}
            >
              {isBusy ? (
                <>
                  <Spinner />
                  <span>
                    {isCompressingPhoto ? 'Mengompres gambar...' : 'Menyimpan...'}
                  </span>
                </>
              ) : (
                itemToEdit ? 'Simpan Perubahan' : 'Tambah Barang'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
