import React, { useState, useEffect, useCallback } from 'react';
import { Item } from './types';
import { getItemPhotoUrl, itemService, GetItemsParams } from './itemService';
import { getErrorMessage } from '../../../services/apiClient';
import { categoryService } from '../categories/categoryService';
import { Category } from '../categories/types';
import { ItemModal } from './ItemModal';
import { ItemPhotoPreview } from './ItemPhotoPreview';
import { LoadingState } from '../../../components/ui/LoadingState';
import './items.css';

const ItemPhotoThumb: React.FC<{ item: Item; onOpen: (item: Item) => void }> = ({ item, onOpen }) => {
  const url = getItemPhotoUrl(item);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!url || hasError) {
    return (
      <span
        className="item-thumb-empty"
        title={url ? 'Foto tidak dapat dimuat' : 'Belum ada foto'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m21 16-5-5-5 5-3-3-5 5" />
        </svg>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="item-thumb-btn"
      onClick={() => onOpen(item)}
      title={`Lihat foto ${item.name}`}
      aria-label={`Lihat foto ${item.name}`}
    >
      <img
        className="item-thumb-img"
        src={url}
        alt={`Foto ${item.name}`}
        onError={() => setHasError(true)}
      />
      <span className="item-thumb-zoom" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
        </svg>
      </span>
    </button>
  );
};

export const ItemPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [stockCondition, setStockCondition] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [previewItem, setPreviewItem] = useState<Item | null>(null);

  // Fetch categories for dropdown filter
  useEffect(() => {
    categoryService
      .getCategories({ per_page: 100 })
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (searchQuery.trim()) {
        const res = await itemService.searchItems(
          searchQuery.trim(),
          selectedCategory === 'all' ? undefined : selectedCategory
        );
        setItems(res.data || []);
      } else {
        const params: GetItemsParams = { per_page: 100 };
        if (selectedCategory !== 'all') params.category_id = selectedCategory;
        if (stockCondition !== 'all') params.stock_condition = stockCondition;
        if (statusFilter === 'active') params.is_active = true;
        if (statusFilter === 'inactive') params.is_active = false;

        const res = await itemService.getItems(params);
        setItems(res.data || []);
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal memuat data barang.'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, stockCondition, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDeactivate = async (item: Item) => {
    if (!window.confirm(`Yakin ingin menonaktifkan material "${item.name}"?`)) return;

    try {
      const res = await itemService.deleteItem(item.id);
      setSuccessMessage(res.message || `Barang "${item.name}" berhasil dinonaktifkan.`);
      fetchItems();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal menonaktifkan barang.'));
    }
  };

  const handleModalSuccess = (msg: string) => {
    setSuccessMessage(msg);
    fetchItems();
  };

  const formatRupiah = (val: string | number | null) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStockBadge = (current: string | number, min: string | number) => {
    const currNum = Number(current);
    const minNum = Number(min);

    if (currNum <= 0) {
      return <span className="stock-badge stock-out">Habis ({currNum})</span>;
    }
    if (currNum <= minNum) {
      return <span className="stock-badge stock-low">Rendah ({currNum})</span>;
    }
    return <span className="stock-badge stock-normal">{currNum}</span>;
  };

  return (
    <div className="items-page">
      {/* Header */}
      <div className="items-header">
        <div>
          <h1 className="items-title">Master Barang & Material</h1>
          <p className="items-subtitle">Katalog inventaris material konstruksi bangunan dan status persediaan stok</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenAddModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Barang</span>
        </button>
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

      {/* Toolbar & Filters */}
      <div className="items-toolbar">
        <div className="items-search-box">
          <span className="items-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="items-search-input"
            placeholder="Cari kode, nama barang, atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="items-filter-group">
          {/* Category Filter */}
          <select
            className="items-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Condition */}
          <select
            className="items-select"
            value={stockCondition}
            onChange={(e) => setStockCondition(e.target.value as 'all' | 'low_stock' | 'out_of_stock')}
          >
            <option value="all">Kondisi Stok</option>
            <option value="low_stock">Stok Rendah (&le; Min)</option>
            <option value="out_of_stock">Stok Habis (0)</option>
          </select>

          {/* Status Filter */}
          <select
            className="items-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>

          <button
            type="button"
            className="btn-icon-action"
            onClick={fetchItems}
            title="Muat ulang data"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <LoadingState message="Memuat data katalog barang..." />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {searchQuery ? 'Tidak ada material yang cocok dengan pencarian.' : 'Belum ada data barang/material.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="btn-icon-action"
                style={{ marginTop: '0.75rem' }}
                onClick={() => setSearchQuery('')}
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '108px', textAlign: 'center' }}>Foto</th>
                <th style={{ width: '110px' }}>Kode SKU</th>
                <th>Nama Barang & Merk</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th>Harga Modal</th>
                <th>Harga Jual</th>
                <th>Stok Saat Ini</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>
                    <ItemPhotoThumb item={item} onOpen={setPreviewItem} />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                      {item.code}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                        {item.name}
                      </span>
                      {item.brand && (
                        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                          Merk: {item.brand}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">
                      {item.category?.name || 'Umum'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{item.unit}</td>
                  <td>
                    <span className="price-text" style={{ color: '#1e293b', fontWeight: 500 }}>
                      {formatRupiah(item.purchase_price)}
                    </span>
                  </td>
                  <td>
                    <span className="price-text" style={{ color: '#0f172a', fontWeight: 600 }}>
                      {formatRupiah(item.selling_price)}
                    </span>
                  </td>
                  <td>
                    {getStockBadge(item.current_stock, item.min_stock)}
                  </td>
                  <td>
                    <span className={`badge-status ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: item.is_active ? '#16a34a' : '#64748b',
                        }}
                      />
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit data barang"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {item.is_active && (
                        <button
                          type="button"
                          className="btn-icon-action btn-icon-danger"
                          onClick={() => handleDeactivate(item)}
                          title="Nonaktifkan barang"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                          <span>Nonaktif</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add / Edit */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        itemToEdit={itemToEdit}
      />

      {/* Pratinjau foto ukuran penuh */}
      <ItemPhotoPreview item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};
