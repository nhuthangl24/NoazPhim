import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { fetchLatestMovies, fetchMoviesByType, normalizeMovie, getImageUrl } from '@/lib/api';

const TYPE_NAMES = {
  'phim-moi-cap-nhat': 'Phim Mới Cập Nhật',
  'phim-le': 'Phim Lẻ',
  'phim-bo': 'Phim Bộ',
  'hoat-hinh': 'Hoạt Hình',
  'tv-shows': 'TV Shows',
  'phim-vietsub': 'Phim Vietsub',
  'phim-thuyet-minh': 'Phim Thuyết Minh',
  'phim-long-tieng': 'Phim Lồng Tiếng',
  'phim-sap-chieu': 'Phim Sắp Chiếu',
};

export async function generateMetadata({ params }) {
  const { type } = await params;
  const name = TYPE_NAMES[type] || type;
  return {
    title: `${name} - NhuThangMovie`,
    description: `Xem ${name} online chất lượng cao, cập nhật nhanh nhất`,
  };
}

export default async function DanhSachPage({ params, searchParams }) {
  const { type } = await params;
  const sp = await searchParams;
  const page = parseInt(sp?.page) || 1;
  const typeName = TYPE_NAMES[type] || type;

  let movies = [];
  let pagination = {};

  try {
    if (type === 'phim-moi-cap-nhat') {
      const data = await fetchLatestMovies(page);
      movies = (data?.items || []).map(normalizeMovie);
      pagination = data?.pagination || {};
    } else {
      const data = await fetchMoviesByType(type, page);
      movies = (data?.data?.items || []).map((item) => ({
        ...normalizeMovie(item),
        posterUrl: getImageUrl(item.poster_url),
        thumbUrl: getImageUrl(item.thumb_url),
      }));
      pagination = data?.data?.params?.pagination || {};
    }
  } catch {
    movies = [];
  }

  return (
    <div>
      <h1 className="page-title">{typeName}</h1>
      <MovieGrid movies={movies} />
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages || 1}
        baseUrl={`/danh-sach/${type}`}
      />
    </div>
  );
}
