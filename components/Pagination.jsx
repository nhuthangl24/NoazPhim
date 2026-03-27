import Link from 'next/link';

export default function Pagination({ currentPage, totalPages, baseUrl, queryParams = {} }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const buildUrl = (page) => {
    const params = new URLSearchParams({ ...queryParams, page: String(page) });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="pagination">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)} className="page-btn">
          ‹ Trước
        </Link>
      )}

      {start > 1 && (
        <>
          <Link href={buildUrl(1)} className="page-btn">1</Link>
          {start > 2 && <span className="page-dots">...</span>}
        </>
      )}

      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
        <Link
          key={page}
          href={buildUrl(page)}
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
        >
          {page}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="page-dots">...</span>}
          <Link href={buildUrl(totalPages)} className="page-btn">{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)} className="page-btn">
          Sau ›
        </Link>
      )}
    </div>
  );
}
