import Link from 'next/link';
import { fetchCountries } from '@/lib/api';

export const metadata = {
  title: 'Quốc Gia - NhuThangMovie',
  description: 'Xem phim theo quốc gia: Việt Nam, Hàn Quốc, Trung Quốc, Âu Mỹ và nhiều quốc gia khác',
};

export default async function QuocGiaPage() {
  let countries = [];
  try {
    countries = await fetchCountries();
  } catch {
    countries = [];
  }

  return (
    <div>
      <h1 className="page-title">Quốc Gia</h1>
      <p className="page-subtitle">Chọn quốc gia để xem phim</p>
      <div className="tag-page-grid">
        {countries.map((country) => (
          <Link key={country.slug} href={`/quoc-gia/${country.slug}`} className="tag-page-item">
            {country.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
