import Link from 'next/link';
import MovieGrid from '@/components/MovieGrid';
import HomePageClient from './_home/HomePageClient';
import { fetchLatestMovies, fetchMoviesByType, normalizeMovie } from '@/lib/api';

function HomeSection({ title, href, movies }) {
  if (!movies?.length) {
    return null;
  }

  return (
    <section className="movie-grid-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link href={href} className="section-link">
          Xem tất cả →
        </Link>
      </div>
      <MovieGrid movies={movies} />
    </section>
  );
}

export default async function HomePage() {
  const [latestData, phimLeData, phimBoData] = await Promise.all([
    fetchLatestMovies(1),
    fetchMoviesByType('phim-le', 1),
    fetchMoviesByType('phim-bo', 1),
  ]);

  const latestMovies = (latestData?.items || []).map(normalizeMovie);
  const phimLe = (phimLeData?.data?.items || []).slice(0, 6).map(normalizeMovie);
  const phimBo = (phimBoData?.data?.items || []).slice(0, 6).map(normalizeMovie);

  return (
    <>
      <HomePageClient latestMovies={latestMovies} />
      <HomeSection title="Phim Mới Cập Nhật" href="/danh-sach/phim-moi-cap-nhat" movies={latestMovies} />
      <HomeSection title="Phim Lẻ" href="/danh-sach/phim-le" movies={phimLe} />
      <HomeSection title="Phim Bộ" href="/danh-sach/phim-bo" movies={phimBo} />
    </>
  );
}
