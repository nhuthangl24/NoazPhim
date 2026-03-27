import MovieCard from './MovieCard';

export default function MovieGrid({ movies, title }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="movie-grid-empty">
        <p>Không có phim nào.</p>
      </div>
    );
  }

  return (
    <section className="movie-grid-section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.slug || movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
