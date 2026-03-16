import { describe, it, expect } from "vitest";
import { sliceBlock } from "../app/lib/pagination";
import { filtersFromSearchParams } from "../app/lib/constants";
import type { Book } from "../app/lib/parser.server";

function makeBook(i: number): Book {
  return {
    id: `id-${i}`,
    title: `Book ${i}`,
    subtitle: "",
    author: `Author ${i}`,
    authorId: "",
    publisher: "",
    year: "2024",
    type: "",
    isbn: "",
    available: true,
  };
}

function makeBooks(n: number): Book[] {
  return Array.from({ length: n }, (_, i) => makeBook(i + 1));
}

describe("sliceBlock", () => {
  it("slices a full block into pages of PAGE_SIZE", () => {
    const books = makeBooks(30);
    const pages = sliceBlock(books, 1, 10);

    expect(pages).toHaveLength(3);
    expect(pages[0]).toEqual({ page: 1, books: books.slice(0, 10) });
    expect(pages[1]).toEqual({ page: 2, books: books.slice(10, 20) });
    expect(pages[2]).toEqual({ page: 3, books: books.slice(20, 30) });
  });

  it("handles a partial last page", () => {
    const books = makeBooks(25);
    const pages = sliceBlock(books, 1, 10);

    expect(pages).toHaveLength(3);
    expect(pages[2].books).toHaveLength(5);
  });

  it("respects totalPages boundary", () => {
    const books = makeBooks(30);
    const pages = sliceBlock(books, 1, 2);

    expect(pages).toHaveLength(2);
    expect(pages.map((p) => p.page)).toEqual([1, 2]);
  });

  it("returns empty array for empty books", () => {
    expect(sliceBlock([], 1, 10)).toEqual([]);
  });

  it("starts at the correct blockFirstPage", () => {
    const books = makeBooks(30);
    const pages = sliceBlock(books, 4, 10);

    expect(pages.map((p) => p.page)).toEqual([4, 5, 6]);
  });
});

describe("filtersFromSearchParams", () => {
  it("parses all parameters", () => {
    const params = new URLSearchParams(
      "q=test&author=foo&yearFrom=2020&yearTo=2024&branch=10,30&type=11:,23:"
    );
    const filters = filtersFromSearchParams(params);

    expect(filters).toEqual({
      keyword: "test",
      author: "foo",
      yearFrom: "2020",
      yearTo: "2024",
      branches: ["10", "30"],
      materialTypes: ["11:", "23:"],
    });
  });

  it("returns defaults for empty params", () => {
    const filters = filtersFromSearchParams(new URLSearchParams());

    expect(filters).toEqual({
      keyword: "",
      author: "",
      yearFrom: "",
      yearTo: "",
      branches: [],
      materialTypes: [],
    });
  });

  it("handles partial params", () => {
    const params = new URLSearchParams("q=hello");
    const filters = filtersFromSearchParams(params);

    expect(filters.keyword).toBe("hello");
    expect(filters.author).toBe("");
    expect(filters.branches).toEqual([]);
  });

  it("handles trailing commas in list params", () => {
    const params = new URLSearchParams("branch=10,,30,");
    const filters = filtersFromSearchParams(params);

    expect(filters.branches).toEqual(["10", "30"]);
  });
});
