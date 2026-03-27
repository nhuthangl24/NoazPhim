'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminEpisodesPage() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Movie search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Form
  const [episodeName, setEpisodeName] = useState('');
  const [linkEmbed, setLinkEmbed] = useState('');
  const [linkM3u8, setLinkM3u8] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/episodes')
      .then((r) => r.json())
      .then((d) => setEpisodes(d.episodes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const searchMovies = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin?keyword=${encodeURIComponent(searchQuery)}`);
      const d = await res.json();
      setSearchResults(d.results || []);
    } catch {} finally { setSearching(false); }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) searchMovies();
      else setSearchResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMovies]);

  const selectMovie = (m) => {
    setSelectedMovie(m);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !episodeName || (!linkEmbed && !linkM3u8)) {
      alert('Vui lòng điền đủ tên tập và ít nhất 1 link (Embed hoặc M3U8)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieName: selectedMovie.name,
          movieSlug: selectedMovie.slug,
          episodeName,
          linkEmbed,
          linkM3u8,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setEpisodes([d.episode, ...episodes]);
        setSelectedMovie(null);
        setEpisodeName('');
        setLinkEmbed('');
        setLinkM3u8('');
      } else {
        alert(d.error || 'Lỗi thêm tập');
      }
    } catch {
      alert('Lỗi server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tập phim này?')) return;
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setEpisodes(episodes.filter((e) => e.id !== id));
    } catch {}
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Thêm Tập Phim Tùy Chỉnh</h1>
        <p>Thêm link/tập riêng của bạn vào một phim có sẵn từ PhimAPI</p>
      </div>

      <div className="schedule-add-card">
        <h3>Tạo tập mới</h3>

        {!selectedMovie ? (
          <div className="movie-search-section">
            <div className="form-group">
              <label>Tìm phim từ API</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên phim để tìm (ví dụ: Tenet)..."
                className="movie-search-input"
              />
            </div>
            {searching && <p className="search-status">Đang tìm...</p>}
            {searchResults.length > 0 && (
              <div className="movie-search-results">
                {searchResults.map((m) => (
                  <button key={m.slug} className="movie-search-item" onClick={() => selectMovie(m)}>
                    {m.posterUrl && <img src={m.posterUrl} alt="" className="movie-search-thumb" />}
                    <div className="movie-search-info">
                      <span className="movie-search-name">{m.name}</span>
                      <span className="movie-search-meta">{m.originName} • {m.year}</span>
                    </div>
                    <span className="movie-search-slug">{m.slug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="selected-movie-card">
            <div className="selected-movie-info">
              {selectedMovie.posterUrl && <img src={selectedMovie.posterUrl} alt="" className="selected-movie-thumb" />}
              <div>
                <span className="selected-movie-name">{selectedMovie.name}</span>
                <span className="selected-movie-meta">{selectedMovie.originName}</span>
              </div>
            </div>
            <button onClick={() => setSelectedMovie(null)} className="btn btn-sm btn-secondary">Đổi phim</button>
          </div>
        )}

        {selectedMovie && (
          <form onSubmit={handleSubmit} className="schedule-add-form">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tên tập <span className="text-danger">*</span></label>
              <input type="text" value={episodeName} onChange={(e) => setEpisodeName(e.target.value)} required placeholder="VD: Tập 1 (Server HN), Bản Cam, Vietsub Nhanh" />
            </div>
            <div className="form-group">
              <label>Link Embed (Iframe)</label>
              <input type="text" value={linkEmbed} onChange={(e) => setLinkEmbed(e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Link M3U8 (Video Player)</label>
              <input type="text" value={linkM3u8} onChange={(e) => setLinkM3u8(e.target.value)} placeholder="https://.../master.m3u8" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu tập phim'}
            </button>
          </form>
        )}
      </div>

      <div className="admin-table-wrapper" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Các tập Custom đã tạo ({episodes.length})</h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : episodes.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Tập</th>
                <th>Loại Link</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{e.movieName}</span>
                    <br />
                    <a href={`/movie/${e.movieSlug}`} target="_blank" rel="noopener" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{e.movieSlug}</a>
                  </td>
                  <td>{e.episodeName}</td>
                  <td>
                    {e.linkM3u8 && <span className="role-badge admin">M3U8</span>}
                    {e.linkEmbed && <span className="role-badge user" style={{ marginLeft: 4 }}>Embed</span>}
                  </td>
                  <td>{formatTime(e.createdAt)}</td>
                  <td><button className="btn-delete" onClick={() => handleDelete(e.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="comment-empty">Chưa có tập custom nào</p>
        )}
      </div>
    </AdminLayout>
  );
}
