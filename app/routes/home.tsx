import { data } from "react-router";
import type { Route } from "./+types/home";
import { fetchSearchResults } from "~/lib/library.server";
import { parseSearchResults } from "~/lib/parser.server";
import { SearchBar } from "~/components/SearchBar";
import { ResultsGrid } from "~/components/ResultsGrid";
import { Pagination } from "~/components/Pagination";

export function meta() {
  return [
    { title: "糸島市立図書館 検索" },
    { name: "description", content: "糸島市立図書館の蔵書検索" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));

  if (!query) {
    return data({ query, page: 1, total: null, totalPages: 1, books: [] });
  }

  const html = await fetchSearchResults(query, page);
  const results = parseSearchResults(html);

  return data({
    query,
    ...results,
    total: results.total as number | null,
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { query, page, total, totalPages, books } = loaderData;

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>
          <a href="/">糸島市立図書館 検索</a>
        </h1>
      </header>
      <SearchBar query={query} total={total} />
      <ResultsGrid books={books} />
      {books.length > 0 && (
        <Pagination query={query} page={page} totalPages={totalPages} />
      )}
    </main>
  );
}
