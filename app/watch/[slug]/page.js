import { fetchMovieDetail, normalizeMovieDetail } from '@/lib/api';
import WatchClient from './WatchClient';
import { getDb } from '@/lib/mongodb';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await fetchMovieDetail(slug);
    return {
      title: `Xem ${data?.movie?.name || slug} - NhuThangMovie`,
      description: `Xem phim ${data?.movie?.name} online miễn phí chất lượng cao`,
    };
  } catch {
    return { title: 'Xem phim - NhuThangMovie' };
  }
}

export default async function WatchPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const episodeSlug = sp?.episode || null;

  let movieData = null;
  let error = null;

  try {
    const raw = await fetchMovieDetail(slug);
    if (raw.status === false) {
      error = 'Không tìm thấy phim';
    } else {
      movieData = normalizeMovieDetail(raw);

      // Fetch custom episodes directly from DB
      try {
        const db = await getDb();
        const customDocs = await db.collection('custom_episodes')
          .find({ movieSlug: slug })
          .sort({ createdAt: 1 })
          .toArray();

        if (customDocs.length > 0) {
          const customEps = customDocs.map(e => ({
            name: e.episodeName,
            slug: e.episodeSlug,
            filename: e.episodeName,
            linkEmbed: e.linkEmbed || '',
            linkM3u8: e.linkM3u8 || ''
          }));
          
          if (movieData.episodes.length > 0) {
            // Merge at the bottom of the first server
            movieData.episodes[0].serverData = [...movieData.episodes[0].serverData, ...customEps];
          } else {
            // If no servers exist, create a default one
            movieData.episodes.push({
              serverName: '#Server 1',
              serverData: customEps
            });
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải custom episodes:', err);
      }
    }
  } catch (e) {
    error = 'Lỗi khi tải dữ liệu phim';
  }

  if (error || !movieData) {
    return (
      <div className="watch-page">
        <div className="player-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6M9 9l6 6"/>
          </svg>
          <p>{error || 'Không tìm thấy phim'}</p>
        </div>
      </div>
    );
  }

  return (
    <WatchClient
      movieData={movieData}
      slug={slug}
      initialEpisodeSlug={episodeSlug}
    />
  );
}
