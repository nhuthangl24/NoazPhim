'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Movie search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Form
  const [episodeName, setEpisodeName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/schedules')
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
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
    if (!selectedMovie || !episodeName || !releaseDate) return;

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieName: selectedMovie.name,
          movieSlug: selectedMovie.slug,
          episodeName,
          releaseDate,
          note,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setSchedules([...schedules, d.schedule]);
        setSelectedMovie(null);
        setEpisodeName('');
        setReleaseDate('');
        setNote('');
      }
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa lịch này?')) return;
    try {
      const res = await fetch('/api/schedules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setSchedules(schedules.filter((s) => s.id !== id));
    } catch {}
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Lịch Ra Tập Mới</h1>
        <p>Tìm phim từ API và thêm lịch phát sóng</p>
      </div>

      {/* Movie search + form */}
      <div className="schedule-add-card">
        <h3>Thêm lịch mới</h3>

        {!selectedMovie ? (
          <div className="movie-search-section">
            <div className="form-group">
              <label>Tìm phim từ API</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên phim để tìm..."
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
                      <span className="movie-search-meta">{m.originName} • {m.year} • {m.episodeCurrent}</span>
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
                <span className="selected-movie-meta">{selectedMovie.originName} • {selectedMovie.year}</span>
                <span className="selected-movie-slug">slug: {selectedMovie.slug}</span>
              </div>
            </div>
            <button onClick={() => setSelectedMovie(null)} className="btn btn-sm btn-secondary">Đổi phim</button>
          </div>
        )}

        {selectedMovie && (
          <form onSubmit={handleSubmit} className="schedule-add-form">
            <div className="form-group">
              <label>Tên tập</label>
              <input type="text" value={episodeName} onChange={(e) => setEpisodeName(e.target.value)} required placeholder="VD: Tập 1120, Full, Tập 5-6" />
            </div>
            <div className="form-group">
              <label>Ngày phát sóng</label>
              <input type="datetime-local" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Ghi chú (tùy chọn)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Arc mới, Season finale" />
            </div>
            <button type="submit" className="btn btn-primary">Thêm lịch</button>
          </form>
        )}
      </div>

      {/* Existing schedules */}
      <div className="admin-table-wrapper" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Lịch hiện tại ({schedules.length})</h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : schedules.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Slug</th>
                <th>Tập</th>
                <th>Ngày phát</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>{s.movieName}</td>
                  <td><a href={`/movie/${s.movieSlug}`} target="_blank" rel="noopener">{s.movieSlug}</a></td>
                  <td>{s.episodeName}</td>
                  <td>{formatTime(s.releaseDate)}</td>
                  <td>{s.note || '-'}</td>
                  <td><button className="btn-delete" onClick={() => handleDelete(s.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="comment-empty">Chưa có lịch nào</p>
        )}
      </div>
    </AdminLayout>
  );
}
