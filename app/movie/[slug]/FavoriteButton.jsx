'use client';

import { useState, useEffect } from 'react';
import { toggleFavorite, isFavorite } from '@/lib/storage';

export default function FavoriteButton({ movie }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(movie.slug));
  }, [movie.slug]);

  const handleToggle = () => {
    const result = toggleFavorite(movie);
    setFav(result);
  };

  return (
    <button
      className={`fav-btn ${fav ? 'active' : ''}`}
      onClick={handleToggle}
      id="favorite-btn"
    >
      {fav ? 'Đã Yêu Thích' : 'Yêu Thích'}
    </button>
  );
}
