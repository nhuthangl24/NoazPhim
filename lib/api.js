const PHIMAPI_BASE = process.env.PHIMAPI_BASE || 'https://phimapi.com';
const PHIMAPI_V1_BASE = process.env.PHIMAPI_V1_BASE || 'https://phimapi.com/v1/api';
const PHIMIMG_BASE = process.env.PHIMIMG_BASE || 'https://phimimg.com';

export function getImageUrl(path) {
  if (!path) return '/no-poster.svg';
  if (path.startsWith('http')) return path;
  return `${PHIMIMG_BASE}/${path}`;
}

export async function fetchLatestMovies(page = 1) {
  const res = await fetch(`${PHIMAPI_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Failed to fetch latest movies');
  return res.json();
}

export async function fetchMovieDetail(slug) {
  const res = await fetch(`${PHIMAPI_BASE}/phim/${slug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Failed to fetch movie detail');
  return res.json();
}

export async function searchMovies(keyword, page = 1) {
  const res = await fetch(`${PHIMAPI_V1_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to search movies');
  return res.json();
}

export async function fetchMoviesByType(type, page = 1) {
  const res = await fetch(`${PHIMAPI_V1_BASE}/danh-sach/${type}?page=${page}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Failed to fetch movies by type');
  return res.json();
}

export async function fetchGenres() {
  const res = await fetch(`${PHIMAPI_BASE}/the-loai`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

export async function fetchCountries() {
  const res = await fetch(`${PHIMAPI_BASE}/quoc-gia`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch countries');
  return res.json();
}

export async function fetchMoviesByGenre(genreSlug, page = 1) {
  const res = await fetch(`${PHIMAPI_V1_BASE}/the-loai/${genreSlug}?page=${page}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Failed to fetch movies by genre');
  return res.json();
}

export async function fetchMoviesByCountry(countrySlug, page = 1) {
  const res = await fetch(`${PHIMAPI_V1_BASE}/quoc-gia/${countrySlug}?page=${page}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Failed to fetch movies by country');
  return res.json();
}

export function normalizeMovie(item) {
  return {
    id: item._id,
    name: item.name,
    slug: item.slug,
    originName: item.origin_name,
    type: item.type,
    posterUrl: getImageUrl(item.poster_url),
    thumbUrl: getImageUrl(item.thumb_url),
    year: item.year,
    quality: item.quality || 'HD',
    lang: item.lang || '',
    episodeCurrent: item.episode_current || '',
    time: item.time || '',
    content: item.content || '',
    categories: item.category || [],
    countries: item.country || [],
    actors: item.actor || [],
    directors: item.director || [],
    trailerUrl: item.trailer_url || '',
    status: item.status || '',
    episodeTotal: item.episode_total || '',
  };
}

export function normalizeMovieDetail(data) {
  const movie = normalizeMovie(data.movie);
  const episodes = (data.episodes || []).map((server) => ({
    serverName: server.server_name,
    serverData: (server.server_data || []).map((ep) => ({
      name: ep.name,
      slug: ep.slug,
      filename: ep.filename || '',
      linkEmbed: ep.link_embed || '',
      linkM3u8: ep.link_m3u8 || '',
    })),
  }));
  return { movie, episodes };
}
