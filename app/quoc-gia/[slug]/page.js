import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { fetchMoviesByCountry, fetchCountries, normalizeMovie, getImageUrl } from '@/lib/api';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const countries = await fetchCountries().catch(() => []);
  const country = countries.find((c) => c.slug === slug);
  return {
    title: `Phim ${country?.name || slug} - NhuThangMovie`,
    description: `Xem phim ${country?.name || slug} online chất lượng cao`,
  };
}

export default async function QuocGiaSlugPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp?.page) || 1;

  const [countries, data] = await Promise.all([
    fetchCountries().catch(() => []),
    fetchMoviesByCountry(slug, page).catch(() => null),
  ]);

  const country = countries.find((c) => c.slug === slug);
  const movies = (data?.data?.items || []).map((item) => ({
    ...normalizeMovie(item),
    posterUrl: getImageUrl(item.poster_url),
    thumbUrl: getImageUrl(item.thumb_url),
  }));
  const pagination = data?.data?.params?.pagination || {};

  return (
    <div>
      <h1 className="page-title">Phim {country?.name || slug}</h1>
      <MovieGrid movies={movies} />
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages || 1}
        baseUrl={`/quoc-gia/${slug}`}
      />
    </div>
  );
}
