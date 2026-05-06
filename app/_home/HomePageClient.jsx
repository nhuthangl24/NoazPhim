'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function HeroSlider({ movies }) {
  const [current, setCurrent] = useState(0);
  const slides = movies.slice(0, 5);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

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
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === current ? 'active' : ''}`}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function formatScheduleDate(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const text = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (days < 0) return { text, badge: 'Đã phát', badgeClass: 'released' };
    if (days === 0) return { text, badge: 'Hôm nay', badgeClass: 'today' };
    if (days === 1) return { text, badge: 'Ngày mai', badgeClass: 'tomorrow' };

    return { text, badge: `${days} ngày nữa`, badgeClass: 'upcoming' };
  } catch {
    return { text: '', badge: '', badgeClass: '' };
  }
}

function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch('/api/schedules')
      .then((response) => response.json())
      .then((data) => setSchedules(data.schedules || []))
      .catch(() => {});
  }, []);

  if (schedules.length === 0) return null;

  return (
    <div className="schedule-section">
      <h2 className="section-title">Lịch Ra Tập Mới</h2>
      <div className="schedule-list">
        {schedules.map((schedule) => {
          const dateInfo = formatScheduleDate(schedule.releaseDate);

          return (
            <div key={schedule.id} className="schedule-item">
              <div className="schedule-date">
                <span className={`schedule-badge ${dateInfo.badgeClass}`}>{dateInfo.badge}</span>
                <span className="schedule-time">{dateInfo.text}</span>
              </div>
              <div className="schedule-info">
                <span className="schedule-movie">
                  {schedule.movieSlug ? (
                    <Link href={`/movie/${schedule.movieSlug}`}>{schedule.movieName}</Link>
                  ) : (
                    schedule.movieName
                  )}
                </span>
                <span className="schedule-episode">{schedule.episodeName}</span>
                {schedule.note && <span className="schedule-note">{schedule.note}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePageClient({ latestMovies }) {
  return (
    <>
      <HeroSlider movies={latestMovies} />
      <ScheduleSection />
    </>
  );
}
