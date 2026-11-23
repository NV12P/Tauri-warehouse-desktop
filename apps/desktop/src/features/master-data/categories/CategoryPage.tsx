import React, { useState, useEffect, useCallback } from 'react';
import { Category } from './types';
import { categoryService } from './categoryService';
import { getErrorMessage } from '../../../services/apiClient';
import { CategoryModal } from './CategoryModal';
import './categories.css';

export const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: { is_active?: boolean; per_page?: number } = { per_page: 100 };
      if (statusFilter === 'active') params.is_active = true;
      if (statusFilter === 'inactive') params.is_active = false;

      const res = await categoryService.getCategories(params);
      setCategories(res.data || []);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal mengambil data kategori.'));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleDeactivate = async (cat: Category) => {
    const confirmMsg = cat.products_count && cat.products_count > 0
      ? `Kategori "${cat.name}" memiliki ${cat.products_count} barang terkait. Yakin ingin menonaktifkannya?`
      : `Yakin ingin menonaktifkan kategori "${cat.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await categoryService.deleteCategory(cat.id);
      setSuccessMessage(res.message || `Kategori "${cat.name}" berhasil dinonaktifkan.`);
      fetchCategories();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal menonaktifkan kategori.'));
    }
  };

  const handleModalSuccess = (msg: string) => {
    setSuccessMessage(msg);
    fetchCategories();
  };

  // Filtered categories by search
  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase();
    const matchName = cat.name.toLowerCase().includes(q);
    const matchDesc = cat.description ? cat.description.toLowerCase().includes(q) : false;
    return matchName || matchDesc;
  });

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Kategori</h1>
          <p className="page-subtitle">Kelola kelompok material konstruksi dan klasifikasi inventaris</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenAddModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Kategori</span>
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

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama atau deskripsi kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <select
            className="filter-select"
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
            onClick={fetchCategories}
            title="Muat ulang data"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-spinner">
            <span className="spinner" style={{ borderColor: '#94a3b8', borderTopColor: '#2563eb' }} />
            <span>Memuat data kategori dari server...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {searchQuery ? 'Tidak ada kategori yang cocok dengan pencarian.' : 'Belum ada data kategori.'}
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
                <th style={{ width: '60px' }}>ID</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th style={{ width: '120px' }}>Jumlah Barang</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ color: '#1e293b', fontWeight: 700 }}>#{cat.id}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
                  </td>
                  <td style={{ color: '#1e293b' }}>
                    {cat.description || <span style={{ fontStyle: 'italic', color: '#64748b' }}>Tidak ada deskripsi</span>}
                  </td>
                  <td>
                    <span className="product-count-badge">
                      {cat.products_count ?? 0} Item
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        cat.is_active ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: cat.is_active ? '#16a34a' : '#64748b',
                        }}
                      />
                      {cat.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => handleOpenEditModal(cat)}
                        title="Edit data kategori"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {cat.is_active && (
                        <button
                          type="button"
                          className="btn-icon-action btn-icon-danger"
                          onClick={() => handleDeactivate(cat)}
                          title="Nonaktifkan kategori"
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
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        categoryToEdit={selectedCategory}
      />
    </div>
  );
};
