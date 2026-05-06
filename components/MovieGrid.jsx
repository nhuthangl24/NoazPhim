import Link from 'next/link';

function MovieCard({ movie }) {
  const { slug, name, posterUrl, year, quality, lang, episodeCurrent } = movie;

  return (
    <Link href={`/movie/${slug}`} className="movie-card" id={`movie-${slug}`}>
      <div className="movie-card-poster">
        <img
          src={posterUrl}
          alt={name}
          loading="lazy"
        />
        <div className="movie-card-overlay">
          <div className="play-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
        {quality && <span className="badge badge-quality">{quality}</span>}
        {lang && <span className="badge badge-lang">{lang}</span>}
        {episodeCurrent && <span className="badge badge-episode">{episodeCurrent}</span>}
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{name}</h3>
        {year && <span className="movie-card-year">{year}</span>}
      </div>
    </Link>
  );
}

export default function MovieGrid({ movies, title }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="movie-grid-empty">
        <p>Không có phim nào.</p>
      </div>
    );
  }

  return (
    <>
      {title && <h2 className="section-title">{title}</h2>}
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.slug || movie.id} movie={movie} />
        ))}
      </div>
    </>
  );
}
