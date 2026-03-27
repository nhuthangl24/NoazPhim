import Link from 'next/link';
import { fetchGenres } from '@/lib/api';

export const metadata = {
  title: 'Thể Loại Phim - NhuThangMovie',
  description: 'Xem phim theo thể loại: Hành Động, Kinh Dị, Tình Cảm, Hài Hước và nhiều thể loại khác',
};

export default async function TheLoaiPage() {
  let genres = [];
  try {
    genres = await fetchGenres();
  } catch {
    genres = [];
  }

  return (
    <div>
      <h1 className="page-title">Thể Loại Phim</h1>
      <p className="page-subtitle">Chọn thể loại phim yêu thích</p>
      <div className="tag-page-grid">
        {genres.map((genre) => (
          <Link key={genre.slug} href={`/the-loai/${genre.slug}`} className="tag-page-item">
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
