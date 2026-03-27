'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, fetchUser, openAuthModal } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (!user) return;
    fetch('/api/auth/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile(d.user);
          setName(d.user.name || '');
          setAvatar(d.user.avatar || '');
        }
      });
  }, [user]);

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 className="auth-title">Hồ Sơ</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Vui lòng đăng nhập để xem hồ sơ</p>
          <button onClick={openAuthModal} className="btn btn-primary">Đăng Nhập</button>
        </div>
      </div>
    );
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar: avatar || null }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      setProfile(data.user);
      fetchUser();
    } catch { setMessage({ type: 'error', text: 'Lỗi server' }); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: 'error', text: data.error }); return; }
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch { setMessage({ type: 'error', text: 'Lỗi server' }); }
    finally { setLoading(false); }
  };

  const avatarDisplay = avatar || null;

  return (
    <div className="profile-page">
      <h1 className="page-title">Hồ Sơ Cá Nhân</h1>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {avatarDisplay ? (
            <img src={avatarDisplay} alt="Avatar" className="profile-avatar-img" />
          ) : (
            <span className="profile-avatar-placeholder">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
          <div className="profile-avatar-info">
            <h2>{profile?.name}</h2>
            <p>{profile?.email}</p>
            <span className={`role-badge ${profile?.role}`}>{profile?.role}</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`admin-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => { setTab('info'); setMessage({ type: '', text: '' }); }}>
            Thông tin
          </button>
          <button className={`admin-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => { setTab('password'); setMessage({ type: '', text: '' }); }}>
            Đổi mật khẩu
          </button>
        </div>

        {message.text && (
          <div className={message.type === 'error' ? 'auth-error' : 'auth-success'}>{message.text}</div>
        )}

        {tab === 'info' && (
          <form onSubmit={handleUpdateInfo} className="auth-form">
            <div className="form-group">
              <label htmlFor="profile-name">Tên hiển thị</label>
              <input type="text" id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="profile-avatar">URL Avatar (tùy chọn)</label>
              <input type="url" id="profile-avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg" />
            </div>
            {avatar && (
              <div className="avatar-preview">
                <img src={avatar} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handleChangePassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="current-pw">Mật khẩu hiện tại</label>
              <input type="password" id="current-pw" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="new-pw">Mật khẩu mới</label>
              <input type="password" id="new-pw" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pw">Xác nhận mật khẩu mới</label>
              <input type="password" id="confirm-pw" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
