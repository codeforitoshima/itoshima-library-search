import { useEffect } from "react";
import type { Book } from "~/lib/parser.server";
import { cacheBooks } from "~/lib/book-cache";
import { BookCard } from "./BookCard";

export function ResultsGrid({ books }: { books: Book[] }) {
  useEffect(() => {
    cacheBooks(books);
  }, [books]);

  if (books.length === 0) return null;

  return (
    <div className="results-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
