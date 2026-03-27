'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function CommentSection({ slug }) {
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {});
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setComments([data.comment, ...comments]);
      setContent('');
    } catch { setError('Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  const handleEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: editContent }),
      });
      if (res.ok) {
        setComments(comments.map((c) =>
          c.id === id ? { ...c, content: editContent.trim(), updatedAt: new Date().toISOString() } : c
        ));
        setEditingId(null);
        setEditContent('');
      }
    } catch {}
  };

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

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const canModify = (c) => user && (c.userId === user.id || user.role === 'admin');

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };

  return (
    <div className="comment-section">
      <h2 className="section-title">Bình Luận ({comments.length})</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-input-wrapper">
            <span className="comment-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận..."
              className="comment-input"
              maxLength={500}
              rows={3}
            />
          </div>
          {error && <p className="comment-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !content.trim()}>
            {loading ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Vui lòng <button onClick={openAuthModal} className="auth-link">đăng nhập</button> để bình luận</p>
        </div>
      )}

      <div className="comment-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <span className="comment-avatar">{c.userName?.[0]?.toUpperCase() || 'U'}</span>
            <div className="comment-body">
              <div className="comment-header">
                <span className="comment-name">{c.userName}</span>
                <span className={`role-badge ${c.userRole || 'user'}`}>{c.userRole === 'admin' ? 'Admin' : 'User'}</span>
                <span className="comment-time">
                  {formatTime(c.createdAt)}
                  {c.updatedAt && ' (đã sửa)'}
                </span>
                {canModify(c) && editingId !== c.id && (
                  <div className="comment-actions">
                    <button className="comment-action-btn" onClick={() => startEdit(c)}>Sửa</button>
                    <button className="comment-action-btn comment-delete" onClick={() => handleDelete(c.id)}>Xóa</button>
                  </div>
                )}
              </div>
              {editingId === c.id ? (
                <div className="comment-edit">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="comment-input"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="comment-edit-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c.id)}>Lưu</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Hủy</button>
                  </div>
                </div>
              ) : (
                <p className="comment-text">{c.content}</p>
              )}
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="comment-empty">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </div>
  );
}
