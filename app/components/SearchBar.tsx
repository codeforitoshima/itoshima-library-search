import { Form, useNavigation } from "react-router";

export function SearchBar({
  query,
  total,
}: {
  query: string;
  total: number | null;
}) {
  const navigation = useNavigation();
  const isSearching = navigation.state === "loading";

  return (
    <div className="search-bar">
      <Form method="get" className="search-form">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="本を検索… (例: 宮沢賢治)"
          aria-label="検索キーワード"
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={isSearching}>
          {isSearching ? "検索中…" : "検索"}
        </button>
      </Form>
      {total !== null && (
        <p className="search-meta">
          {total > 0 ? `${total}件の結果` : "結果が見つかりませんでした"}
        </p>
      )}
    </div>
  );
}
