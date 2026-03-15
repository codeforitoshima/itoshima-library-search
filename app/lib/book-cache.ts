import type { Book } from "./parser.server";

const cache = new Map<string, Book>();
const coverCache = new Map<string, string>();

export function cacheBooks(books: Book[]) {
  for (const book of books) {
    cache.set(book.id, book);
  }
}

export function getCachedBook(id: string): Book | undefined {
  return cache.get(id);
}

export function cacheCoverUrl(isbn: string, url: string) {
  coverCache.set(isbn, url);
}

export function getCachedCoverUrl(isbn: string): string | null {
  return coverCache.get(isbn) ?? null;
}
