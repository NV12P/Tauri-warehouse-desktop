import React from 'react';
import { User } from '../auth/types';

interface DashboardOverviewProps {
  user: User;
  onNavigateToCategories: () => void;
  onNavigateToItems: () => void;
  onNavigateToTransactions: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  onNavigateToCategories,
  onNavigateToItems,
  onNavigateToTransactions,
}) => {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          Selamat Datang, {user.name || user.username}!
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>
          Dasbor Operasional Manajemen Material Gudang Konstruksi
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Modul Aktif</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0' }}>
            Master Kategori
          </h2>
          <button
            type="button"
            onClick={onNavigateToCategories}
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Buka Kategori &rarr;
          </button>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Modul Aktif</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0' }}>
            Master Barang
          </h2>
          <button
            type="button"
            onClick={onNavigateToItems}
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Buka Katalog Barang &rarr;
          </button>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Modul Aktif</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0' }}>
            Transaksi Stok
          </h2>
          <button
            type="button"
            onClick={onNavigateToTransactions}
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Kelola Transaksi &rarr;
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#0f172a' }}>
          Panduan Langkah Pengembangan (Fokus Fungsi):
        </h3>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.875rem', lineHeight: '1.7' }}>
          <li>
            <strong>Master Kategori:</strong> Buat kategori material dasar (misalnya: <em>Semen, Besi Beton, Pasir & Batu, Cat & Finishing, Alat Kerja</em>).
          </li>
          <li>
            <strong>Master Barang:</strong> Menghubungkan material baru ke kategori yang telah dibuat.
          </li>
          <li>
            <strong>Transaksi Masuk & Keluar:</strong> Mengelola barang datang dari supplier dan material yang keluar ke proyek.
          </li>
        </ol>
      </div>
    </div>
  );
};
