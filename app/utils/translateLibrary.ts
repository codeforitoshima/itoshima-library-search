import type { TFunction } from "i18next";

export function translateLibrary(raw: string, t: TFunction): string {
  if (raw.includes("本館")) return t("branch.main");
  if (raw.includes("志摩館")) return t("branch.shima");
  if (raw.includes("二丈館")) return t("branch.nijo");
  return raw;
}
