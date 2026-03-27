'use client';

const HISTORY_KEY = 'nhuthang_watch_history';
const FAVORITES_KEY = 'nhuthang_favorites';

export function getWatchHistory() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveWatchProgress(slug, episode, currentTime, movieData = {}) {
  if (typeof window === 'undefined') return;
  const history = getWatchHistory();
  const existingIndex = history.findIndex((h) => h.slug === slug);
  const entry = {
    slug,
    episode,
    currentTime,
    updatedAt: Date.now(),
    name: movieData.name || '',
    posterUrl: movieData.posterUrl || '',
    episodeName: movieData.episodeName || '',
  };
  if (existingIndex >= 0) {
    history[existingIndex] = entry;
  } else {
    history.unshift(entry);
  }
  // Keep only last 50
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function getWatchProgress(slug) {
  const history = getWatchHistory();
  return history.find((h) => h.slug === slug) || null;
}

export function getFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(movie) {
  if (typeof window === 'undefined') return false;
  const favorites = getFavorites();
  const existingIndex = favorites.findIndex((f) => f.slug === movie.slug);
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return false;
  } else {
    favorites.unshift({
      slug: movie.slug,
      name: movie.name,
      posterUrl: movie.posterUrl,
      year: movie.year,
      quality: movie.quality,
      addedAt: Date.now(),
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 100)));
    return true;
  }
}

export function isFavorite(slug) {
  const favorites = getFavorites();
  return favorites.some((f) => f.slug === slug);
}
