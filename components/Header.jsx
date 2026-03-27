'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.refresh();
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          <span className="logo-text">NhuThang<span className="logo-accent">Movie</span></span>
        </Link>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
          <Link href="/danh-sach/phim-le" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Phim Lẻ</Link>
          <Link href="/danh-sach/phim-bo" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Phim Bộ</Link>
          <Link href="/danh-sach/hoat-hinh" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Hoạt Hình</Link>
          <Link href="/the-loai" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Thể Loại</Link>
          <Link href="/quoc-gia" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Quốc Gia</Link>
        </nav>

        <div className="header-right">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phim..."
              className="search-input"
              id="header-search-input"
            />
            <button type="submit" className="search-btn" id="header-search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {user ? (
            <div className="user-menu-wrapper">
              <button className="user-menu-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <span className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{user.name}</span>
                    <span className="user-dropdown-email">{user.email}</span>
                  </div>
                  <div className="user-dropdown-divider" />
                  <Link href="/profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>Hồ Sơ</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button className="user-dropdown-item" onClick={handleLogout}>Đăng Xuất</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openAuthModal} className="btn btn-primary btn-sm header-auth-btn">Đăng Nhập</button>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className="hamburger"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
