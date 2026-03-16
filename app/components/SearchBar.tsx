import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { PAGE_SIZE, BRANCHES, MATERIAL_TYPES, type SearchFilters } from "~/lib/constants";

export function SearchBar({
  filters,
  total,
  page,
  loading,
}: {
  filters: SearchFilters;
  total: number | null;
  page: number;
  loading?: boolean;
}) {
  const navigation = useNavigation();
  const isSearching = navigation.state === "loading";
  const hasFilters = !!(filters.author || filters.yearFrom || filters.yearTo || filters.branch || filters.materialType);
  const [open, setOpen] = useState(hasFilters);

  return (
    <div className="search-bar">
      <Form method="get" className="search-form">
        <div className="search-row">
          <input
            type="search"
            name="q"
            defaultValue={filters.keyword}
            placeholder="本を検索… (例: 宮沢賢治)"
            aria-label="検索キーワード"
            className="search-input"
            autoFocus={!filters.keyword}
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? "検索中…" : "検索"}
          </button>
        </div>

        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          詳細検索 {open ? "▲" : "▼"}
        </button>

        {open && (
          <div className="advanced-filters">
            <div className="filter-row">
              <label htmlFor="author-input" className="filter-label">著者</label>
              <input
                id="author-input"
                type="text"
                name="author"
                defaultValue={filters.author}
                className="filter-input"
              />
            </div>

            <div className="filter-row">
              <span className="filter-label">出版年</span>
              <div className="year-range">
                <input
                  type="number"
                  name="yearFrom"
                  defaultValue={filters.yearFrom}
                  placeholder="開始年"
                  min="1950"
                  max="2099"
                  className="filter-input year-input"
                  aria-label="出版年（開始）"
                />
                <span className="year-separator">〜</span>
                <input
                  type="number"
                  name="yearTo"
                  defaultValue={filters.yearTo}
                  placeholder="終了年"
                  min="1950"
                  max="2099"
                  className="filter-input year-input"
                  aria-label="出版年（終了）"
                />
              </div>
            </div>

            <div className="filter-row">
              <label htmlFor="branch-select" className="filter-label">所蔵館</label>
              <select
                id="branch-select"
                name="branch"
                defaultValue={filters.branch}
                className="filter-select"
              >
                {BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <label htmlFor="type-select" className="filter-label">資料種別</label>
              <select
                id="type-select"
                name="type"
                defaultValue={filters.materialType}
                className="filter-select"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Form>
      <div aria-live="polite" aria-atomic="true">
        {loading && filters.keyword && (
          <p className="search-meta loading-meta">
            <span className="spinner" /> {`${(page - 1) * PAGE_SIZE + 1}〜${page * PAGE_SIZE}件目を読み込み中…`}
          </p>
        )}
        {!loading && total !== null && (
          <p className="search-meta">
            {total > 0
              ? `${total}件中 ${(page - 1) * PAGE_SIZE + 1}〜${Math.min(page * PAGE_SIZE, total)}件目`
              : "結果が見つかりませんでした"}
          </p>
        )}
      </div>
    </div>
  );
}
