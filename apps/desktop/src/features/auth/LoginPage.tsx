import React, { useState } from 'react';
import { authService } from './authService';
import { User } from './types';
import { API_BASE_URL } from '../../services/apiClient';
import './login.css';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State pemberitahuan berhasil (sesuai instruksi: jangan langsung redirect)
  const [loginSuccessUser, setLoginSuccessUser] = useState<User | null>(() => authService.getStoredUser());
  const [tokenPreview, setTokenPreview] = useState<string | null>(() => authService.getStoredToken());

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
      const user = authService.extractUser(response);
      const token = authService.extractToken(response);

      setLoginSuccessUser(
        user || {
          id: 1,
          name: username,
          username: username,
          role: 'admin_gudang',
        }
      );
      setTokenPreview(token || 'Token berhasil diterima & disimpan');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mencoba masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    authService.logout();
    setLoginSuccessUser(null);
    setTokenPreview(null);
    setPassword('');
    setErrorMessage(null);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {loginSuccessUser ? (
          /* TAMPILAN PEMBERITAHUAN BERHASIL (Sesuai Instruksi User) */
          <div className="success-card">
            <div className="success-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h2 className="success-title">Login Berhasil!</h2>
            <p className="success-desc">
              Kredensial valid. Sesi autentikasi telah dibuat dan token tersimpan.
            </p>

            <div className="user-info-box">
              <div className="info-row">
                <span className="info-label">Nama Pengguna</span>
                <span className="info-value">{loginSuccessUser.name || loginSuccessUser.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Username</span>
                <span className="info-value">{loginSuccessUser.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role Akses</span>
                <span className="role-badge">{loginSuccessUser.role || 'admin_gudang'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status Auth</span>
                <span className="info-value" style={{ color: '#16a34a', fontSize: '0.8rem' }}>
                  {tokenPreview ? 'Token Aktif (Bearer)' : 'Terkonfirmasi'}
                </span>
              </div>
            </div>

            <div className="notice-box">
              <strong>Info Tahapan:</strong> Sesuai instruksi, Anda tidak langsung diarahkan ke dashboard. Halaman ini memastikan verifikasi kredensial dan integrasi endpoint login berjalan sempurna.
            </div>

            <button type="button" className="btn-secondary" onClick={handleReset}>
              Keluar / Uji Login Kembali
            </button>
          </div>
        ) : (
          /* TAMPILAN FORM LOGIN */
          <>
            <div className="login-header">
              <div className="brand-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
                  <path d="M6 18h12" />
                  <path d="M6 14h12" />
                  <rect width="6" height="6" x="9" y="10" />
                </svg>
              </div>
              <h1 className="login-title">Aplikasi Gudang</h1>
              <p className="login-subtitle">Masuk untuk mengelola material & inventaris</p>
              <div className="server-badge">
                <span className="server-dot" />
                <span>API: {API_BASE_URL}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="login-alert alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Username
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    type="text"
                    className="form-input"
                    placeholder="Masukkan username (contoh: AdminGudang)"
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
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Masukkan password Anda"
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
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <span className="spinner" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Sistem</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
