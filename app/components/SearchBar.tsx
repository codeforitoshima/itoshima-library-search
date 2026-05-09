import { useRef, useState } from "react";
import { Form, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import { PAGE_SIZE, BRANCHES, MATERIAL_TYPES, type SearchFilters } from "~/lib/constants";

export function SearchBar({
  filters,
  total,
  page,
  loading,
  lang,
}: {
  filters: SearchFilters;
  total: number | null;
  page: number;
  loading?: boolean;
  lang: string;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isSearching = navigation.state === "loading";
  const hasSearch = !!(filters.keyword || filters.author || filters.yearFrom || filters.yearTo || filters.branches.length || filters.materialTypes.length);
  const hasAdvancedFilters = !!(filters.author || filters.yearFrom || filters.yearTo || filters.branches.length || filters.materialTypes.length);
  const [open, setOpen] = useState(!hasSearch || hasAdvancedFilters);
  const [keyword, setKeyword] = useState(filters.keyword);
  const [author, setAuthor] = useState(filters.author);
  const [yearFrom, setYearFrom] = useState(filters.yearFrom);
  const [yearTo, setYearTo] = useState(filters.yearTo);
  const [checkedBranches, setCheckedBranches] = useState<string[]>(filters.branches);
  const [checkedTypes, setCheckedTypes] = useState<string[]>(filters.materialTypes);
  const cannotSearch = !keyword.trim() && !author.trim();
  const formRef = useRef<HTMLFormElement>(null);
  const yearFromRef = useRef<HTMLInputElement>(null);
  const yearToRef = useRef<HTMLInputElement>(null);

  function toggleBranch(value: string) {
    setCheckedBranches((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleType(value: string) {
    setCheckedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function resetAll() {
    setKeyword("");
    setAuthor("");
    setYearFrom("");
    setYearTo("");
    if (yearFromRef.current) yearFromRef.current.value = "";
    if (yearToRef.current) yearToRef.current.value = "";
    setCheckedBranches([]);
    setCheckedTypes([]);
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    (document.activeElement as HTMLElement)?.blur();
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      const str = value.toString().trim();
      if (str) params.set(key, str);
    }
    window.location.href = `/${lang}?${params.toString()}`;
  }

  const branchLabel: Record<string, string> = {
    "10": t("branch.main"),
    "30": t("branch.nijo"),
    "40": t("branch.shima"),
  };

  const typeLabel: Record<string, string> = {
    "11:": t("materialType.general"),
    "12:": t("materialType.children"),
    "23:": t("materialType.magazine"),
    "34:": t("materialType.av"),
  };

  return (
    <div className="search-bar">
      <Form method="get" className="search-form" ref={formRef} onSubmit={handleSubmit}>
        <div className="search-row">
          <div className="clearable-input">
            <input
              type="search"
              name="q"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.label")}
              enterKeyHint="search"
              className="search-input"
              autoFocus={!filters.keyword}
            />
            {keyword && (
              <button type="button" className="clear-button" onClick={() => setKeyword("")} aria-label={t("search.clearKeyword")}>×</button>
            )}
          </div>
          <button type="submit" className="search-button" disabled={isSearching || cannotSearch}>
            {isSearching ? t("search.loading") : t("search.button")}
          </button>
        </div>

        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {open ? t("search.advancedOpen") : t("search.advancedClose")}
        </button>

        {open && (
          <div className="advanced-filters">
            <div className="filter-row">
              <label htmlFor="author-input" className="filter-label">{t("search.author")}</label>
              <div className="clearable-input">
                <input
                  id="author-input"
                  type="text"
                  name="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="filter-input"
                />
                {author && (
                  <button type="button" className="clear-button" onClick={() => setAuthor("")} aria-label={t("search.clearAuthor")}>×</button>
                )}
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label">{t("search.branch")}</span>
              <div className="checkbox-group">
                {BRANCHES.map((b) => (
                  <label key={b.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={checkedBranches.includes(b.value)}
                      onChange={() => toggleBranch(b.value)}
                    />
                    {branchLabel[b.value] ?? b.label}
                  </label>
                ))}
              </div>
              {checkedBranches.length > 0 && (
                <input type="hidden" name="branch" value={checkedBranches.join(",")} />
              )}
            </div>

            <div className="filter-row">
              <span className="filter-label">{t("search.yearRange")}</span>
              <div className="year-range">
                <input
                  ref={yearFromRef}
                  type="number"
                  name="yearFrom"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  placeholder={t("search.yearFrom")}
                  inputMode="numeric"
                  enterKeyHint="done"
                  className="filter-input year-input"
                  aria-label={t("search.yearFromLabel")}
                />
                <span className="year-separator">〜</span>
                <input
                  ref={yearToRef}
                  type="number"
                  name="yearTo"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  placeholder={t("search.yearTo")}
                  inputMode="numeric"
                  enterKeyHint="done"
                  className="filter-input year-input"
                  aria-label={t("search.yearToLabel")}
                />
              </div>
            </div>

            <div className="filter-row">
              <span className="filter-label">{t("search.materialType")}</span>
              <div className="checkbox-group">
                {MATERIAL_TYPES.map((mt) => (
                  <label key={mt.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={checkedTypes.includes(mt.value)}
                      onChange={() => toggleType(mt.value)}
                    />
                    {typeLabel[mt.value] ?? mt.label}
                  </label>
                ))}
              </div>
              {checkedTypes.length > 0 && (
                <input type="hidden" name="type" value={checkedTypes.join(",")} />
              )}
            </div>

            <button type="button" className="reset-button" onClick={resetAll}>
              {t("search.reset")}
            </button>
          </div>
        )}
      </Form>
      <div aria-live="polite" aria-atomic="true">
        {cannotSearch && total === null && (
          <p className="search-hint">{t("search.hint")}</p>
        )}
        {loading && filters.keyword && (
          <p className="search-meta loading-meta">
            <span className="spinner" />{" "}
            {t("search.loadingResults", {
              from: (page - 1) * PAGE_SIZE + 1,
              to: page * PAGE_SIZE,
            })}
          </p>
        )}
        {!loading && total !== null && (
          <p className="search-meta">
            {total > 0
              ? t("search.resultsCount", {
                  total,
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                })
              : t("search.noResults")}
          </p>
        )}
      </div>
    </div>
  );
}
