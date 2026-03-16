import type { Route } from "./+types/api.search";
import { fetchSearchResults } from "~/lib/library.server";
import { parseSearchResults } from "~/lib/parser.server";
import { PAGE_SIZE, type SearchFilters } from "~/lib/constants";

const BLOCK_SIZE = 3;

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function filtersFromParams(params: URLSearchParams): SearchFilters {
  return {
    keyword: params.get("q") ?? "",
    author: params.get("author") ?? "",
    yearFrom: params.get("yearFrom") ?? "",
    yearTo: params.get("yearTo") ?? "",
    branches: parseList(params.get("branch")),
    materialTypes: parseList(params.get("type")),
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const filters = filtersFromParams(params);
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  if (!filters.keyword && !filters.author) {
    return Response.json({ filters, total: 0, totalPages: 1, pages: [] });
  }

  const fetchCount = PAGE_SIZE * BLOCK_SIZE;
  const apiPage = Math.ceil(page / BLOCK_SIZE);
  const blockFirstPage = (apiPage - 1) * BLOCK_SIZE + 1;

  const html = await fetchSearchResults(filters, apiPage, fetchCount);
  const results = parseSearchResults(html);
  const total = results.total;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  const pages: { page: number; books: typeof results.books }[] = [];
  for (let i = 0; i * PAGE_SIZE < results.books.length; i++) {
    const p = blockFirstPage + i;
    if (p > totalPages) break;
    const books = results.books.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);
    if (books.length > 0) {
      pages.push({ page: p, books });
    }
  }

  return Response.json({ filters, total, totalPages, pages });
}
