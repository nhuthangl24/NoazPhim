'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(() => {
        // Load users separately
        return fetch('/api/admin/users');
      })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Đổi vai trò thành ${newRole}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changeRole', userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch {}
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Quản Lý Người Dùng</h1>
        <p>{users.length} người dùng</p>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="td-user">
                    <span className="user-avatar-sm">{u.name?.[0]?.toUpperCase() || 'U'}</span>
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                  <td>{formatTime(u.createdAt)}</td>
                  <td>
                    {u.role === 'user' ? (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleRoleChange(u.id, 'admin')}>
                        Nâng Admin
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleRoleChange(u.id, 'user')}>
                        Hạ User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
