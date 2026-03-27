'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function AuthModal() {
  const { showModal, closeAuthModal, loginSuccess } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showModal) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
        return;
      }

      if (mode === 'register') {
        setSuccess('Đăng ký thành công!');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 1200);
      } else {
        loginSuccess(data.user);
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuthModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m18 6-12 12M6 6l12 12" />
          </svg>
        </button>

        <h2 className="auth-title">{mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}</h2>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="modal-name">Tên hiển thị</label>
              <input type="text" id="modal-name" name="name" value={form.name} onChange={handleChange} placeholder="Nhập tên của bạn" />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="modal-email">Email</label>
            <input type="email" id="modal-email" name="email" value={form.email} onChange={handleChange} placeholder="Nhập email" required />
          </div>
          <div className="form-group">
            <label htmlFor="modal-password">Mật khẩu</label>
            <input type="password" id="modal-password" name="password" value={form.password} onChange={handleChange} placeholder="Nhập mật khẩu" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <p>Chưa có tài khoản? <button onClick={() => switchMode('register')} className="auth-link">Đăng ký</button></p>
          ) : (
            <p>Đã có tài khoản? <button onClick={() => switchMode('login')} className="auth-link">Đăng nhập</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
