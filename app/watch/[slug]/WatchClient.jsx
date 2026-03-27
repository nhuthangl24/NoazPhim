'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ArtPlayerComponent from '@/components/ArtPlayerComponent';
import { saveWatchProgress, getWatchProgress } from '@/lib/storage';

export default function WatchClient({ movieData, slug, initialEpisodeSlug }) {
  const router = useRouter();
  const { movie, episodes } = movieData;

  // Memoize to avoid recreating on every render
  const allEpisodes = useMemo(
    () =>
      episodes.flatMap((server) =>
        server.serverData.map((ep) => ({ ...ep, serverName: server.serverName }))
      ),
    [episodes]
  );

  const getInitialEpisode = () => {
    if (initialEpisodeSlug) {
      return allEpisodes.find((ep) => ep.slug === initialEpisodeSlug) || allEpisodes[0] || null;
    }
    return allEpisodes[0] || null;
  };

  const [currentEpisode, setCurrentEpisode] = useState(getInitialEpisode);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    if (!currentEpisode) {
      setVideoError(true);
      return;
    }

    setVideoError(false);
    const m3u8 = currentEpisode.linkM3u8;

    if (m3u8) {
      setVideoUrl(m3u8);
    } else {
      // Fallback to MongoDB
      fetch(`/api/fallback/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status && data.m3u8) {
            setVideoUrl(data.m3u8);
          } else {
            setVideoError(true);
          }
        })
        .catch(() => setVideoError(true));
    }

    // Restore watch progress
    const progress = getWatchProgress(slug);
    if (progress && progress.episode === currentEpisode.slug) {
      setInitialTime(progress.currentTime || 0);
    } else {
      setInitialTime(0);
    }
  }, [currentEpisode, slug]);

  const handleTimeUpdate = useCallback(
    (time) => {
      if (currentEpisode) {
        saveWatchProgress(slug, currentEpisode.slug, time, {
          name: movie.name,
          posterUrl: movie.posterUrl,
          episodeName: currentEpisode.name,
        });
      }
    },
    [slug, currentEpisode, movie]
  );

  const handleEpisodeClick = (ep) => {
    setCurrentEpisode(ep);
    setVideoUrl('');
    setVideoError(false);
    router.push(`/watch/${slug}?episode=${ep.slug}`, { scroll: false });
  };

  return (
    <div className="watch-page">
      {videoError ? (
        <div className="player-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
          <p>Không thể phát video. Vui lòng thử lại sau.</p>
          <Link href={`/movie/${slug}`} className="btn btn-secondary btn-sm">
            ← Quay lại trang phim
          </Link>
        </div>
      ) : videoUrl ? (
        <ArtPlayerComponent
          url={videoUrl}
          title={`${movie.name}${currentEpisode ? ` - ${currentEpisode.name}` : ''}`}
          onTimeUpdate={handleTimeUpdate}
          initialTime={initialTime}
        />
      ) : (
        <div className="player-error">
          <div className="spinner"></div>
          <p>Đang tải video...</p>
        </div>
      )}

      <div className="watch-info">
        <div>
          <h1 className="watch-movie-title">{movie.name}</h1>
          {currentEpisode && (
            <p className="watch-episode-name">
              Đang xem: {currentEpisode.name}
              {currentEpisode.serverName && ` • ${currentEpisode.serverName}`}
            </p>
          )}
        </div>
        <Link href={`/movie/${slug}`} className="btn btn-secondary btn-sm">
          Thông tin phim
        </Link>
      </div>

      {episodes.length > 0 && (
        <div className="episode-section">
          <h2 className="section-title">Danh Sách Tập</h2>
          {episodes.map((server, idx) => (
            <div key={idx} className="episode-server">
              <div className="episode-server-name">{server.serverName}</div>
              <div className="episode-grid">
                {server.serverData.map((ep) => (
                  <button
                    key={ep.slug}
                    className={`episode-btn ${
                      currentEpisode?.slug === ep.slug ? 'active' : ''
                    }`}
                    onClick={() => handleEpisodeClick(ep)}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
