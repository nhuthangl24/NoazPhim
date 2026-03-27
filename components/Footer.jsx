import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="logo-text">NhuThang<span className="logo-accent">Movie</span></span>
          </Link>
          <p className="footer-desc">Xem phim online chất lượng cao, cập nhật nhanh nhất.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Danh Mục</h4>
            <Link href="/danh-sach/phim-le">Phim Lẻ</Link>
            <Link href="/danh-sach/phim-bo">Phim Bộ</Link>
            <Link href="/danh-sach/hoat-hinh">Hoạt Hình</Link>
            <Link href="/danh-sach/tv-shows">TV Shows</Link>
          </div>
          <div className="footer-col">
            <h4>Khám Phá</h4>
            <Link href="/the-loai">Thể Loại</Link>
            <Link href="/quoc-gia">Quốc Gia</Link>
            <Link href="/search">Tìm Kiếm</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 NhuThangMovie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
