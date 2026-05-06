import Link from 'next/link';
import { fetchMovieDetail, normalizeMovieDetail } from '@/lib/api';
import FavoriteButton from './FavoriteButton';
import TrailerModalButton from './TrailerModalButton';
import CommentSection from '@/components/CommentSection';
import { getDb } from '@/lib/mongodb';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await fetchMovieDetail(slug);
    const movie = data?.movie;
    return {
      title: `${movie?.name || slug} - NhuThangMovie`,
      description: movie?.content || `Xem phim ${movie?.name} online chất lượng cao`,
    };
  } catch {
    return { title: 'Chi tiết phim - NhuThangMovie' };
  }
}

export default async function MovieDetailPage({ params }) {
  const { slug } = await params;

  let movieData;
  try {
    const raw = await fetchMovieDetail(slug);
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

  } catch {
    return (
      <div className="movie-grid-empty">
        <h2>Không tìm thấy phim</h2>
        <p>Phim bạn tìm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '20px' }}>← Về trang chủ</Link>
      </div>
    );
  }

  const { movie, episodes } = movieData;

  return (
    <div className="movie-detail">
      <div className="movie-detail-header">
        <div className="movie-detail-poster">
          <img src={movie.posterUrl} alt={movie.name} />
        </div>

        <div className="movie-detail-info">
          <h1 className="movie-detail-title">
            {movie.name}
            {movie.originName && (
              <span className="movie-detail-origin"> ({movie.originName})</span>
            )}
          </h1>

          <div className="movie-meta-grid">
            {movie.year && (
              <div className="meta-item">
                <span className="meta-label">Năm:</span>
                <span className="meta-value">{movie.year}</span>
              </div>
            )}
            {movie.quality && (
              <div className="meta-item">
                <span className="meta-label">Chất lượng:</span>
                <span className="meta-value">{movie.quality}</span>
              </div>
            )}
            {movie.lang && (
              <div className="meta-item">
                <span className="meta-label">Ngôn ngữ:</span>
                <span className="meta-value">{movie.lang}</span>
              </div>
            )}
            {movie.time && (
              <div className="meta-item">
                <span className="meta-label">Thời lượng:</span>
                <span className="meta-value">{movie.time}</span>
              </div>
            )}
            {movie.episodeCurrent && (
              <div className="meta-item">
                <span className="meta-label">Trạng thái:</span>
                <span className="meta-value">{movie.episodeCurrent}</span>
              </div>
            )}
            {movie.directors?.length > 0 && (
              <div className="meta-item">
                <span className="meta-label">Đạo diễn:</span>
                <span className="meta-value">{movie.directors.join(', ')}</span>
              </div>
            )}
          </div>

          {movie.categories?.length > 0 && (
            <div className="tag-list">
              {movie.categories.map((cat) => (
                <Link key={cat.slug} href={`/the-loai/${cat.slug}`} className="tag">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {movie.countries?.length > 0 && (
            <div className="tag-list">
              {movie.countries.map((c) => (
                <Link key={c.slug} href={`/quoc-gia/${c.slug}`} className="tag">
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {movie.content && (
            <div className="movie-description" dangerouslySetInnerHTML={{ __html: movie.content }} />
          )}

          {movie.actors?.length > 0 && (
            <div>
              <span className="meta-label">Diễn viên: </span>
              <span className="meta-value" style={{ fontSize: '0.9rem' }}>
                {movie.actors.join(', ')}
              </span>
            </div>
          )}

          <div className="movie-detail-actions">
            <Link href={`/watch/${slug}`} className="btn btn-primary">
              Xem Phim
            </Link>
            <TrailerModalButton trailerUrl={movie.trailerUrl} />
            <FavoriteButton movie={movie} />
          </div>
        </div>
      </div>

      {episodes.length > 0 && (
        <div className="episode-section">
          <h2 className="section-title">Danh Sách Tập</h2>
          {episodes.map((server, idx) => (
            <div key={idx} className="episode-server">
              <div className="episode-server-name">{server.serverName}</div>
              <div className="episode-grid">
                {server.serverData.map((ep) => (
                  <Link
                    key={ep.slug}
                    href={`/watch/${slug}?episode=${ep.slug}`}
                    className="episode-btn"
                  >
                    {ep.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CommentSection slug={slug} />
    </div>
  );
}
