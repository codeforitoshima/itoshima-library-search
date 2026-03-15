import type { Book } from "./parser.server";

const cache = new Map<string, Book>();

export function cacheBooks(books: Book[]) {
  for (const book of books) {
    cache.set(book.id, book);
  }
}

export function getCachedBook(id: string): Book | undefined {
  return cache.get(id);
}
