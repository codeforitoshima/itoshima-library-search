import type { Route } from "./+types/api.search";
import { fetchSearchResults } from "~/lib/library.server";
import { parseSearchResults } from "~/lib/parser.server";
import { BLOCK_SIZE, PAGE_SIZE, filtersFromSearchParams, safePage } from "~/lib/constants";
import { sliceBlock } from "~/lib/pagination";

export async function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const filters = filtersFromSearchParams(params);
  const page = safePage(params.get("page"));

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

  const pages = sliceBlock(results.books, blockFirstPage, totalPages);

  return Response.json({ filters, total, totalPages, pages });
}
