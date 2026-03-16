export const PAGE_SIZE = 10;

export type SearchFilters = {
  keyword: string;
  author: string;
  yearFrom: string;
  yearTo: string;
  branch: string;
  materialType: string;
};

export const EMPTY_FILTERS: SearchFilters = {
  keyword: "",
  author: "",
  yearFrom: "",
  yearTo: "",
  branch: "",
  materialType: "",
};

export const BRANCHES = [
  { value: "", label: "すべて" },
  { value: "10", label: "本館" },
  { value: "30", label: "二丈館" },
  { value: "40", label: "志摩館" },
] as const;

export const MATERIAL_TYPES = [
  { value: "", label: "すべて" },
  { value: "11:", label: "一般図書" },
  { value: "12:", label: "児童図書" },
  { value: "23:", label: "雑誌" },
  { value: "34:", label: "AV" },
] as const;

export function filtersToSearchParams(filters: SearchFilters): string {
  const params = new URLSearchParams();
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.author) params.set("author", filters.author);
  if (filters.yearFrom) params.set("yearFrom", filters.yearFrom);
  if (filters.yearTo) params.set("yearTo", filters.yearTo);
  if (filters.branch) params.set("branch", filters.branch);
  if (filters.materialType) params.set("type", filters.materialType);
  return params.toString();
}
