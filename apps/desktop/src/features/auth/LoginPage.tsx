import React, { useState } from 'react';
import { authService } from './authService';
import { User } from './types';
import { getErrorMessage } from '../../services/apiClient';
import { Spinner } from '../../components/ui/Spinner';
import './login.css';

interface LoginPageProps {
  onEnterApp?: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onEnterApp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });
      const user = authService.extractUser(response) || {
        id: 1,
        name: username,
        username: username,
        role: 'admin_gudang',
      };
      if (onEnterApp) {
        onEnterApp(user);
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Username atau password salah.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* ── Panel Kiri: Branding ── */}
      <div className="login-panel-left">
        {/* Logo atas */}
        <div className="brand-top">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
              <path d="M6 18h12" />
              <path d="M6 14h12" />
              <rect width="6" height="6" x="9" y="10" />
            </svg>
          </div>
          <div>
            <p className="brand-name">Aplikasi Gudang</p>
            <p className="brand-tagline">Material & Konstruksi</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="brand-hero">
          <h2 className="brand-hero-title">
            Kelola gudang<br />
            lebih <span>efisien</span>.
          </h2>
          <p className="brand-hero-desc">
            Pantau stok material, catat transaksi masuk &amp; keluar,
            dan dapatkan laporan inventaris secara real-time.
          </p>

          <div className="brand-features">
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <span className="brand-feature-text">Manajemen stok material konstruksi</span>
            </div>
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m16 3 4 4-4 4" />
                  <path d="M20 7H4" />
                  <path d="m8 21-4-4 4-4" />
                  <path d="M4 17h16" />
                </svg>
              </div>
              <span className="brand-feature-text">Pencatatan transaksi barang masuk & keluar</span>
            </div>
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span className="brand-feature-text">Laporan dan ringkasan operasional harian</span>
            </div>
          </div>
        </div>

        <p className="brand-footer">© 2026 Aplikasi Gudang. Versi 0.1.0</p>
      </div>

      {/* ── Panel Kanan: Form ── */}
      <div className="login-panel-right">
        <div className="login-form-box">
          <div className="login-form-header">
            <h1 className="login-form-title">Masuk ke akun</h1>
            <p className="login-form-subtitle">
              Gunakan username dan password yang diberikan admin.
            </p>
          </div>

          {errorMessage && (
            <div className="login-alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: AdminGudang"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
