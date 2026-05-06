'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [siteSettingsSaving, setSiteSettingsSaving] = useState(false);
  const [siteSettingsMessage, setSiteSettingsMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let active = true;

    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setStats(d.stats);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    fetch('/api/admin/site-settings')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setSiteSettings(d.settings);
        setSiteSettingsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setSiteSettingsLoading(false);
        setSiteSettingsMessage({ type: 'error', text: 'Không tải được trạng thái khóa website.' });
      });

    return () => {
      active = false;
    };
  }, []);

  const handleToggleSiteLock = async () => {
    if (!siteSettings) return;

    setSiteSettingsSaving(true);
    setSiteSettingsMessage({ type: '', text: '' });

    try {
      const nextLocked = !siteSettings.siteLocked;
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteLocked: nextLocked }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      setSiteSettings(data.settings);
      setSiteSettingsMessage({
        type: 'success',
        text: nextLocked
          ? 'Đã bật chế độ khóa website. Người dùng thường sẽ chỉ thấy trang thông báo.'
          : 'Đã tắt chế độ khóa website. Website hoạt động bình thường trở lại.',
      });
    } catch (error) {
      setSiteSettingsMessage({ type: 'error', text: error.message || 'Cập nhật thất bại.' });
    } finally {
      setSiteSettingsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Tổng Quan</h1>
        <p>Chào mừng đến trang quản trị NhuThangMovie</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.userCount || 0}</div>
            <div className="stat-label">Người dùng</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon comments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.commentCount || 0}</div>
            <div className="stat-label">Bình luận</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon schedules">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.scheduleCount || 0}</div>
            <div className="stat-label">Lịch phát sóng</div>
          </div>
        </div>
      </div>

      <div className="admin-quick-links" style={{ marginBottom: '32px' }}>
        <h2>Trạng thái website</h2>
        <div className="site-setting-card">
          <div className="site-setting-copy">
            <span className={`site-setting-status ${siteSettings?.siteLocked ? 'locked' : 'open'}`}>
              {siteSettingsLoading ? 'Đang tải...' : siteSettings?.siteLocked ? 'Đang khóa công khai' : 'Đang mở bình thường'}
            </span>
            <h3>Khóa website công khai</h3>
            <p>
              Khi bật, người dùng thường chỉ thấy trang thông báo &quot;nội dung chỉ phục vụ cho đồ án&quot;.
              Chỉ các đường dẫn admin và auth mới được giữ lại để quản trị viên vào tắt.
            </p>
            {siteSettingsMessage.text && (
              <p className={`site-setting-feedback ${siteSettingsMessage.type}`}>
                {siteSettingsMessage.text}
              </p>
            )}
          </div>
          <button
            type="button"
            className={`btn ${siteSettings?.siteLocked ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggleSiteLock}
            disabled={siteSettingsLoading || siteSettingsSaving}
          >
            {siteSettingsSaving ? 'Đang cập nhật...' : siteSettings?.siteLocked ? 'Tắt chế độ khóa' : 'Bật chế độ khóa'}
          </button>
        </div>
      </div>

      <div className="admin-quick-links">
        <h2>Truy cập nhanh</h2>
        <div className="quick-link-grid">
          <Link href="/admin/users" className="quick-link-card">
            <span className="ql-title">Quản lý người dùng</span>
            <span className="ql-desc">Xem, đổi vai trò người dùng</span>
          </Link>
          <Link href="/admin/comments" className="quick-link-card">
            <span className="ql-title">Quản lý bình luận</span>
            <span className="ql-desc">Xem, xóa bình luận</span>
          </Link>
          <Link href="/admin/schedules" className="quick-link-card">
            <span className="ql-title">Lịch ra tập</span>
            <span className="ql-desc">Tìm phim từ API, thêm lịch</span>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
