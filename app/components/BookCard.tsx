import type { Book } from "~/lib/parser.server";

const GOOGLE_BOOKS_COVER_URL =
  "https://books.google.com/books/content?printsec=frontcover&img=1&zoom=1&source=gbs_api";

function coverUrl(isbn: string): string {
  return `${GOOGLE_BOOKS_COVER_URL}&isbn=${isbn}`;
}

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card">
      {book.isbn && (
        <div className="book-cover">
          <img
            src={coverUrl(book.isbn)}
            alt=""
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="book-info">
        <h3 className="book-title">
          {book.title}
          {book.subtitle && (
            <span className="book-subtitle"> — {book.subtitle}</span>
          )}
        </h3>
        {book.author && <p className="book-author">{book.author}</p>}
        <div className="book-meta">
          {book.publisher && <span>{book.publisher}</span>}
          {book.year && <span>{book.year}</span>}
          {book.type && <span>{book.type}</span>}
        </div>
        <span
          className={`book-availability ${book.available ? "available" : "lent"}`}
        >
          {book.available ? "利用可能" : "貸出中"}
        </span>
      </div>
    </article>
  );
}
