'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { normalizeMovie, getImageUrl } from '@/lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get('keyword') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  const [query, setQuery] = useState(keyword);
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (keyword) {
      setLoading(true);
      setSearched(true);
      fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&page=${page}`)
        .then((res) => res.json())
        .then((data) => {
          const items = (data?.data?.items || []).map((item) => ({
            ...normalizeMovie(item),
            posterUrl: getImageUrl(item.poster_url),
            thumbUrl: getImageUrl(item.thumb_url),
          }));
          setMovies(items);
          setPagination(data?.data?.params?.pagination || {});
        })
        .catch(() => setMovies([]))
        .finally(() => setLoading(false));
    }
  }, [keyword, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div>
      <h1 className="page-title">Tìm Kiếm Phim</h1>

      <form className="search-page-form" onSubmit={handleSearch}>
        <div className="search-page-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên phim..."
            className="search-page-input"
            id="search-page-input"
          />
          <button type="submit" className="search-page-button" id="search-page-button">
            Tìm Kiếm
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : searched ? (
        <>
          <p className="page-subtitle">
            {movies.length > 0
              ? `Tìm thấy ${pagination.totalItems || movies.length} kết quả cho "${keyword}"`
              : `Không tìm thấy kết quả cho "${keyword}"`}
          </p>
          <MovieGrid movies={movies} />
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages || 1}
            baseUrl="/search"
            queryParams={{ keyword }}
          />
        </>
      ) : (
        <p className="page-subtitle">Nhập từ khóa để tìm kiếm phim yêu thích</p>
      )}
    </div>
  );
}
