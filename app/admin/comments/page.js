'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/comments')
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setComments(comments.filter((c) => c.id !== id));
    } catch {}
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Quản Lý Bình Luận</h1>
        <p>{comments.length} bình luận</p>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Phim</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td className="td-user">
                    <span className="user-avatar-sm">{c.userName?.[0]?.toUpperCase() || 'U'}</span>
                    {c.userName}
                  </td>
                  <td><a href={`/movie/${c.slug}`} target="_blank" rel="noopener">{c.slug}</a></td>
                  <td className="admin-comment-content">{c.content}</td>
                  <td>{formatTime(c.createdAt)}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(c.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {comments.length === 0 && <p className="comment-empty">Chưa có bình luận nào</p>}
        </div>
      )}
    </AdminLayout>
  );
}
