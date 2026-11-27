import React, { useState, useEffect } from 'react';
import { Category, CategoryInput } from './types';
import { categoryService } from './categoryService';
import { getErrorMessage } from '../../../services/apiClient';
import { Spinner } from '../../../components/ui/Spinner';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  categoryToEdit: Category | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || '');
      setIsActive(Boolean(categoryToEdit.is_active));
    } else {
      setName('');
      setDescription('');
      setIsActive(true);
    }
    setErrorMessage(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama kategori wajib diisi.');
      return;
    }

    const payload: CategoryInput = {
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      is_active: isActive,
    };

    setIsLoading(true);
    try {
      if (categoryToEdit) {
        const res = await categoryService.updateCategory(categoryToEdit.id, payload);
        onSuccess(res.message || 'Kategori berhasil diperbarui.');
      } else {
        const res = await categoryService.createCategory(payload);
        onSuccess(res.message || 'Kategori berhasil ditambahkan.');
      }
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Gagal menyimpan kategori.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {categoryToEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}
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
          <div className="form-group">
            <label className="form-label" htmlFor="cat-name">
              Nama Kategori <span className="required">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              className="form-input"
              placeholder="Contoh: Semen & Pasir, Besi & Baja, Cat Tembok"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cat-desc">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="cat-desc"
              className="form-textarea"
              placeholder="Keterangan singkat mengenai kategori material ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isLoading}
              />
              <span>Kategori Aktif</span>
            </label>
            <span className="checkbox-hint">Kategori nonaktif tidak akan muncul pada pilihan kasir/POS</span>
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
              {isLoading ? (
                <>
                  <Spinner />
                  <span>Menyimpan...</span>
                </>
              ) : (
                categoryToEdit ? 'Simpan Perubahan' : 'Tambah Kategori'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
