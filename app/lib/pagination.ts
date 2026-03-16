import { PAGE_SIZE } from "./constants";
import type { Book } from "./parser.server";

export function sliceBlock(
  allBooks: Book[],
  blockFirstPage: number,
  totalPages: number
): { page: number; books: Book[] }[] {
  const pages: { page: number; books: Book[] }[] = [];
  for (let i = 0; i * PAGE_SIZE < allBooks.length; i++) {
    const p = blockFirstPage + i;
    if (p > totalPages) break;
    const books = allBooks.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);
    if (books.length > 0) {
      pages.push({ page: p, books });
    }
  }
  return pages;
}
