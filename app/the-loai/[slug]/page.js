import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { fetchMoviesByGenre, fetchGenres, normalizeMovie, getImageUrl } from '@/lib/api';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const genres = await fetchGenres().catch(() => []);
  const genre = genres.find((g) => g.slug === slug);
  return {
    title: `${genre?.name || slug} - Thể Loại - NhuThangMovie`,
    description: `Xem phim thể loại ${genre?.name || slug} online chất lượng cao`,
  };
}

export default async function TheLoaiSlugPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp?.page) || 1;

  const [genres, data] = await Promise.all([
    fetchGenres().catch(() => []),
    fetchMoviesByGenre(slug, page).catch(() => null),
  ]);

  const genre = genres.find((g) => g.slug === slug);
  const movies = (data?.data?.items || []).map((item) => ({
    ...normalizeMovie(item),
    posterUrl: getImageUrl(item.poster_url),
    thumbUrl: getImageUrl(item.thumb_url),
  }));
  const pagination = data?.data?.params?.pagination || {};

  return (
    <div>
      <h1 className="page-title">Thể Loại: {genre?.name || slug}</h1>
      <MovieGrid movies={movies} />
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages || 1}
        baseUrl={`/the-loai/${slug}`}
      />
    </div>
  );
}
