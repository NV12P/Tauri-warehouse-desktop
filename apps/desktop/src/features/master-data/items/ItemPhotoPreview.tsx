import React, { useEffect } from 'react';
import { Item } from './types';
import { getItemPhotoUrl } from './itemService';

interface ItemPhotoPreviewProps {
  item: Item | null;
  onClose: () => void;
}

export const ItemPhotoPreview: React.FC<ItemPhotoPreviewProps> = ({ item, onClose }) => {
  const photoUrl = item ? getItemPhotoUrl(item) : null;
  const isOpen = Boolean(item && photoUrl);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item || !photoUrl) return null;

  return (
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${item.name}`}>
      <div className="photo-lightbox__backdrop" onClick={onClose} />
      <div className="photo-lightbox__content" onClick={(e) => e.stopPropagation()}>
        <div className="photo-lightbox__header">
          <div>
            <div className="photo-lightbox__title">{item.name}</div>
            <div className="photo-lightbox__meta">
              {item.code}
              {item.brand ? ` · ${item.brand}` : ''}
            </div>
          </div>
          <button type="button" className="photo-lightbox__close" onClick={onClose} aria-label="Tutup pratinjau">
            &times;
          </button>
        </div>

        <div className="photo-lightbox__body">
          <img className="photo-lightbox__img" src={photoUrl} alt={`Foto ${item.name}`} />
        </div>

        <div className="photo-lightbox__caption">
          Klik di luar gambar atau tekan <kbd>Esc</kbd> untuk menutup
        </div>
      </div>
    </div>
  );
};
