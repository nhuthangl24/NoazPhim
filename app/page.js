import Link from 'next/link';
import MovieGrid from '@/components/MovieGrid';
import HeroSlider from '@/components/HeroSlider';
import ScheduleSection from '@/components/ScheduleSection';
import { fetchLatestMovies, fetchMoviesByType, normalizeMovie, getImageUrl } from '@/lib/api';

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
      <HeroSlider movies={latestMovies} />

      <ScheduleSection />

      <div className="movie-grid-section">
        <div className="section-header">
          <h2 className="section-title">Phim Mới Cập Nhật</h2>
          <Link href="/danh-sach/phim-moi-cap-nhat" className="section-link">Xem tất cả →</Link>
        </div>
        <div className="movie-grid">
          {latestMovies.map((m) => (
            <Link key={m.slug} href={`/movie/${m.slug}`} className="movie-card" id={`movie-${m.slug}`}>
              <div className="movie-card-poster">
                <img src={m.posterUrl} alt={m.name} loading="lazy" />
                <div className="movie-card-overlay">
                  <div className="play-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
                {m.quality && <span className="badge badge-quality">{m.quality}</span>}
                {m.lang && <span className="badge badge-lang">{m.lang}</span>}
              </div>
              <div className="movie-card-info">
                <h3 className="movie-card-title">{m.name}</h3>
                {m.year && <span className="movie-card-year">{m.year}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {phimLe.length > 0 && (
        <div className="movie-grid-section">
          <div className="section-header">
            <h2 className="section-title">Phim Lẻ</h2>
            <Link href="/danh-sach/phim-le" className="section-link">Xem tất cả →</Link>
          </div>
          <div className="movie-grid">
            {phimLe.map((m) => (
              <Link key={m.slug} href={`/movie/${m.slug}`} className="movie-card" id={`movie-${m.slug}`}>
                <div className="movie-card-poster">
                  <img src={m.posterUrl} alt={m.name} loading="lazy" />
                  <div className="movie-card-overlay">
                    <div className="play-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                  {m.quality && <span className="badge badge-quality">{m.quality}</span>}
                  {m.lang && <span className="badge badge-lang">{m.lang}</span>}
                </div>
                <div className="movie-card-info">
                  <h3 className="movie-card-title">{m.name}</h3>
                  {m.year && <span className="movie-card-year">{m.year}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {phimBo.length > 0 && (
        <div className="movie-grid-section">
          <div className="section-header">
            <h2 className="section-title">Phim Bộ</h2>
            <Link href="/danh-sach/phim-bo" className="section-link">Xem tất cả →</Link>
          </div>
          <div className="movie-grid">
            {phimBo.map((m) => (
              <Link key={m.slug} href={`/movie/${m.slug}`} className="movie-card" id={`movie-${m.slug}`}>
                <div className="movie-card-poster">
                  <img src={m.posterUrl} alt={m.name} loading="lazy" />
                  <div className="movie-card-overlay">
                    <div className="play-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                  {m.quality && <span className="badge badge-quality">{m.quality}</span>}
                  {m.episodeCurrent && <span className="badge badge-episode">{m.episodeCurrent}</span>}
                </div>
                <div className="movie-card-info">
                  <h3 className="movie-card-title">{m.name}</h3>
                  {m.year && <span className="movie-card-year">{m.year}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
