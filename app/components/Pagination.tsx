import { Link } from "react-router";

export function Pagination({
  query,
  page,
  totalPages,
}: {
  query: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav className="pagination" aria-label="ページ移動">
      {page > 1 && (
        <Link to={`/?q=${encodeURIComponent(query)}&page=${page - 1}`} className="page-link">
          ← 前
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="page-ellipsis">
            …
          </span>
        ) : (
          <Link
            key={p}
            to={`/?q=${encodeURIComponent(query)}&page=${p}`}
            className={`page-link ${p === page ? "current" : ""}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link to={`/?q=${encodeURIComponent(query)}&page=${page + 1}`} className="page-link">
          次 →
        </Link>
      )}
    </nav>
  );
}

function buildPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
