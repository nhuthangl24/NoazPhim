'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function HeroSlider({ movies = [] }) {
  const [current, setCurrent] = useState(0);
  const slides = movies.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const movie = slides[current];

  return (
    <section className="hero" key={current}>
      <div className="hero-bg" style={{ backgroundImage: `url(${movie.thumbUrl})` }} />
      <div className="hero-content">
        <h1 className="hero-title">{movie.name}</h1>
        <div className="hero-meta">
          {movie.year && <span className="hero-tag">{movie.year}</span>}
          {movie.quality && <span className="hero-tag">{movie.quality}</span>}
          {movie.lang && <span className="hero-tag">{movie.lang}</span>}
          {movie.episodeCurrent && <span className="hero-tag">{movie.episodeCurrent}</span>}
        </div>
        <div className="hero-actions">
          <Link href={`/watch/${movie.slug}`} className="btn btn-primary">
            Xem Ngay
          </Link>
          <Link href={`/movie/${movie.slug}`} className="btn btn-secondary">
            Chi Tiết
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
