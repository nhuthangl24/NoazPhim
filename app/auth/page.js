'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
        setSuccess('Đăng ký thành công! Đang chuyển sang đăng nhập...');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 1500);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
        </h1>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-name">Tên hiển thị</label>
              <input
                type="text"
                id="auth-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Mật khẩu</label>
            <input
              type="password"
              id="auth-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <p>Chưa có tài khoản? <button onClick={() => { setMode('register'); setError(''); }} className="auth-link">Đăng ký</button></p>
          ) : (
            <p>Đã có tài khoản? <button onClick={() => { setMode('login'); setError(''); }} className="auth-link">Đăng nhập</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
