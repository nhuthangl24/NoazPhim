import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: '20px',
    }}>
      <div style={{ fontSize: '6rem', fontWeight: 800, color: '#e50914', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Trang Không Tồn Tại</h1>
      <p style={{ color: '#8b8ba3', maxWidth: '400px' }}>
        Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link href="/" className="btn btn-primary">
        Về Trang Chủ
      </Link>
    </div>
  );
}
