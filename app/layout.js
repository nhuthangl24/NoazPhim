import Providers from '@/components/Providers';
import AppLayout from '@/components/AppLayout';
import './globals.css';

export const metadata = {
  title: 'NhuThangMovie - Xem Phim Online',
  description: 'Xem phim online chất lượng cao, cập nhật nhanh nhất. Phim lẻ, phim bộ, hoạt hình vietsub.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
