import React from 'react';
import { User } from '../features/auth/types';
import './layout.css';

type AppTab = 'dashboard' | 'categories' | 'items' | 'transactions' | 'movements';

interface MainLayoutProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onLogout: () => void;
  user: User;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  user,
  children,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'categories':
        return 'Master Kategori';
      case 'items':
        return 'Master Barang (Material)';
      case 'transactions':
        return 'Transaksi Stok';
      case 'movements':
        return 'Riwayat Pergerakan Stok';
      default:
        return 'Dashboard Operasional';
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Nav */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
              <path d="M6 18h12" />
              <path d="M6 14h12" />
              <rect width="6" height="6" x="9" y="10" />
            </svg>
          </div>
          <div>
            <h2 className="sidebar-app-name">Aplikasi Gudang</h2>
            <p className="sidebar-app-sub">Material & Konstruksi</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Menu Utama</span>

          <button
            type="button"
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span>Dashboard</span>
          </button>

          <span className="nav-section-title">Master Data</span>

          <button
            type="button"
            className={`nav-item ${currentTab === 'categories' ? 'active' : ''}`}
            onClick={() => onTabChange('categories')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            <span>Kategori Barang</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentTab === 'items' ? 'active' : ''}`}
            onClick={() => onTabChange('items')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span>Data Barang (Item)</span>
          </button>

          <span className="nav-section-title">Inventaris</span>

          <button
            type="button"
            className={`nav-item ${currentTab === 'transactions' ? 'active' : ''}`}
            onClick={() => onTabChange('transactions')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m16 3 4 4-4 4" />
              <path d="M20 7H4" />
              <path d="m8 21-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
            <span>Transaksi Stok</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentTab === 'movements' ? 'active' : ''}`}
            onClick={() => onTabChange('movements')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h14" />
              <path d="m13 8 4 4-4 4" />
              <path d="M21 5v14" />
            </svg>
            <span>Riwayat Pergerakan</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{getInitials(user.name || user.username)}</div>
            <div className="user-details">
              <p className="user-name">{user.name || user.username}</p>
              <span className="user-role-badge">{user.role || 'admin_gudang'}</span>
            </div>
          </div>
          <button type="button" className="btn-logout" onClick={onLogout} title="Keluar dari akun">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-breadcrumb">
            <span>Aplikasi Gudang</span>
            <span>/</span>
            <strong>{getBreadcrumbTitle()}</strong>
          </div>


        </header>

        {/* Content Body */}
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
};
