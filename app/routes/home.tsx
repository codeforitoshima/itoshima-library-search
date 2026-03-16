import { data } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { fetchSearchResults } from "~/lib/library.server";
import { parseSearchResults, type Book } from "~/lib/parser.server";
import { PAGE_SIZE, type SearchFilters, filtersToSearchParams } from "~/lib/constants";
import { getCachedSearchPage, cacheSearchPage } from "~/lib/book-cache";
import { SearchBar } from "~/components/SearchBar";
import { ResultsGrid } from "~/components/ResultsGrid";
import { Pagination } from "~/components/Pagination";
import { Footer } from "~/components/Footer";
import { ThemeToggle } from "~/components/ThemeToggle";

export function meta() {
  return [
    { title: "糸島図書館 非公式検索" },
    { name: "description", content: "糸島市立図書館の蔵書を検索できる非公式ツール" },
    { property: "og:title", content: "糸島図書館 非公式検索" },
    { property: "og:description", content: "糸島市立図書館の蔵書を検索できる非公式ツール" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "糸島図書館 非公式検索" },
  ];
}

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function filtersFromUrl(url: URL): SearchFilters {
  return {
    keyword: url.searchParams.get("q") ?? "",
    author: url.searchParams.get("author") ?? "",
    yearFrom: url.searchParams.get("yearFrom") ?? "",
    yearTo: url.searchParams.get("yearTo") ?? "",
    branches: parseList(url.searchParams.get("branch")),
    materialTypes: parseList(url.searchParams.get("type")),
  };
}

function cacheKey(filters: SearchFilters, page: number): string {
  return `${filters.keyword}|${filters.author}|${filters.yearFrom}|${filters.yearTo}|${filters.branches.join(",")}|${filters.materialTypes.join(",")}:${page}`;
}

function sliceBlock(allBooks: Book[], blockFirstPage: number, totalPages: number): { page: number; books: Book[] }[] {
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

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const filters = filtersFromUrl(url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));

  if (!filters.keyword && !filters.author) {
    return data({ filters, page: 1, total: null, totalPages: 1, books: [], adjacentPages: [] });
  }

  // Fetch in aligned 3-page blocks (30 results).
  // Block 1 = pages 1-3, block 2 = pages 4-6, etc.
  const BLOCK_SIZE = 3;
  const fetchCount = PAGE_SIZE * BLOCK_SIZE;
  const apiPage = Math.ceil(page / BLOCK_SIZE);
  const blockFirstPage = (apiPage - 1) * BLOCK_SIZE + 1;

  const html = await fetchSearchResults(filters, apiPage, fetchCount);
  const results = parseSearchResults(html);

  const total = results.total;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  // Slice fetched books into individual pages
  const currentBlockPages = sliceBlock(results.books, blockFirstPage, totalPages);
  const currentEntry = currentBlockPages.find((p) => p.page === page);
  const currentBooks = currentEntry?.books ?? [];

  const adjacentPages = currentBlockPages.filter((p) => p.page !== page);

  return data({
    filters,
    page,
    total: total as number | null,
    totalPages,
    books: currentBooks,
    adjacentPages,
  });
}

type AdjacentPage = { page: number; books: Book[] };

type HomeData = {
  filters: SearchFilters;
  page: number;
  total: number | null;
  totalPages: number;
  books: Book[];
  adjacentPages?: AdjacentPage[];
  loading?: boolean;
};

function cacheAdjacentPages(d: HomeData) {
  for (const adj of d.adjacentPages ?? []) {
    const adjKey = cacheKey(d.filters, adj.page);
    if (!getCachedSearchPage(adjKey)) {
      cacheSearchPage(adjKey, {
        page: adj.page,
        total: d.total,
        totalPages: d.totalPages,
        books: adj.books,
      });
    }
  }
}

let pendingResults: Promise<HomeData> | null = null;

export async function clientLoader({
  serverLoader,
  request,
}: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const filters = filtersFromUrl(url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));

  if (!filters.keyword && !filters.author) {
    pendingResults = null;
    return { filters, page: 1, total: null, totalPages: 1, books: [] };
  }

  const key = cacheKey(filters, page);
  const cached = getCachedSearchPage(key);
  if (cached) {
    pendingResults = null;
    return { ...cached, filters, loading: false };
  }

  pendingResults = serverLoader() as Promise<HomeData>;
  return {
    filters,
    page,
    total: null,
    totalPages: 1,
    books: [],
    loading: true,
  };
}

function useFullResults(loaderData: HomeData) {
  const [results, setResults] = useState(loaderData);

  useEffect(() => {
    setResults(loaderData);
  }, [loaderData]);

  useEffect(() => {
    if (!pendingResults) return;
    let cancelled = false;
    pendingResults.then((fullData) => {
      if (!cancelled) {
        setResults(fullData);
        pendingResults = null;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loaderData]);

  // Cache current page + adjacent pages from block fetch
  useEffect(() => {
    if (!results.loading && results.books.length > 0) {
      cacheSearchPage(cacheKey(results.filters, results.page), results);
      cacheAdjacentPages(results);
    }
  }, [results]);

  return results;
}

// Track in-flight prefetch requests to avoid duplicates
const prefetchInFlight = new Set<string>();

function usePrefetchNextBlock(filters: SearchFilters, page: number, totalPages: number, loading?: boolean) {
  useEffect(() => {
    if (loading || totalPages <= 1) return;

    // Find the first uncached page ahead (look up to 5 pages)
    let targetPage = 0;
    for (let p = page + 1; p <= Math.min(page + 5, totalPages); p++) {
      const key = cacheKey(filters, p);
      if (!getCachedSearchPage(key) && !prefetchInFlight.has(key)) {
        targetPage = p;
        break;
      }
    }
    if (!targetPage) return;

    // Mark the block as in-flight
    const BLOCK_SIZE = 3;
    const blockFirst = (Math.ceil(targetPage / BLOCK_SIZE) - 1) * BLOCK_SIZE + 1;
    const blockKeys: string[] = [];
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const key = cacheKey(filters, blockFirst + i);
      blockKeys.push(key);
      prefetchInFlight.add(key);
    }

    const params = filtersToSearchParams(filters);
    fetch(`/api/search?${params}&page=${targetPage}`)
      .then((res) => res.json())
      .then((data: { total: number; totalPages: number; pages: { page: number; books: Book[] }[] }) => {
        for (const entry of data.pages) {
          const key = cacheKey(filters, entry.page);
          if (!getCachedSearchPage(key)) {
            cacheSearchPage(key, {
              page: entry.page,
              total: data.total,
              totalPages: data.totalPages,
              books: entry.books,
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        for (const key of blockKeys) {
          prefetchInFlight.delete(key);
        }
      });
    // No cleanup — fetch continues in background even if component re-renders
  }, [filters, page, totalPages, loading]);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const results = useFullResults(loaderData as HomeData);
  const { filters, page, total, totalPages, books, loading } = results;

  usePrefetchNextBlock(filters, page, totalPages, loading);

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>
          <a href="/">
            <img src="/icon-192.png" alt="" className="header-icon" />
            糸島図書館 非公式検索
          </a>
        </h1>
        <ThemeToggle />
      </header>
      <SearchBar filters={filters} total={total} page={page} loading={loading} />
      {!loading && (
        <>
          <ResultsGrid books={books} />
          {books.length > 0 && (
            <Pagination filters={filters} page={page} totalPages={totalPages} />
          )}
        </>
      )}
      <Footer />
    </main>
  );
}
