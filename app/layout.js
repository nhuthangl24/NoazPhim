import { AuthProvider } from '@/components/AuthContext';
import AuthModal from '@/components/AuthModal';
import AppLayout from '@/components/AppLayout';
import SiteLockScreen from '@/components/SiteLockScreen';
import { getSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/site-settings';
import { headers } from 'next/headers';
import './globals.css';

export const metadata = {
  title: 'NhuThangMovie - Xem Phim Online',
  description: 'Xem phim online chất lượng cao, cập nhật nhanh nhất. Phim lẻ, phim bộ, hoạt hình vietsub.',
};

export default async function RootLayout({ children }) {
  const [requestHeaders, session, siteSettings] = await Promise.all([
    headers(),
    getSession(),
    getSiteSettings(),
  ]);
  const pathname = requestHeaders.get('x-pathname') || '/';
  const allowWhenLocked = pathname.startsWith('/admin') || pathname.startsWith('/auth');
  const shouldShowLockScreen = siteSettings.siteLocked && session?.role !== 'admin' && !allowWhenLocked;

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {shouldShowLockScreen ? (
          <SiteLockScreen settings={siteSettings} />
        ) : (
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <AuthModal />
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
