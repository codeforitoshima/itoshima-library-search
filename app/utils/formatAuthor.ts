import type { TFunction } from "i18next";

function normalizeRole(raw: string): string {
  let role = raw.trim();
  // Strip surrounding brackets: [著] → 著, 〔著〕 → 著
  role = role.replace(/^[[〔](.+)[\]〕]$/, "$1").trim();
  // Strip leading ほか/[ほか] prefix
  role = role.replace(/^\[?ほか\]?/, "").trim();
  // Strip separators ・ and fullwidth space 　 so 文　絵, 文・絵, 文絵 all become 文絵
  role = role.replace(/[・　]/g, "");

  // Normalize known hiragana compounds after separator removal
  if (role === "ぶんえ" || role === "さくえ") return "文絵";
  // Normalize single hiragana roles
  if (role === "ぶん" || role === "さく") return "著";

  // Normalize kanji variants
  if (["文", "作", "詩"].includes(role)) return "著";
  if (role === "画") return "絵";
  if (role === "共著") return "著";
  if (role === "総監修") return "監修";
  if (role === "総編集") return "編集";
  // Normalize compound order variants
  if (role === "文写真") return "写真文";
  if (role === "脚本絵") return "文絵";
  // Normalize director+anything → 監督
  if (role.startsWith("監督")) return "監督";

  return role;
}

export function formatAuthor(raw: string, t: TFunction): string {
  const sepIdx = raw.indexOf("／");
  if (sepIdx === -1) return raw.trim();
  const name = raw.slice(0, sepIdx).trim();
  const rawRole = raw.slice(sepIdx + 1).trim();
  const normalizedRole = normalizeRole(rawRole);
  const translatedRole = t(`book.authorRoles.${normalizedRole}`, { defaultValue: rawRole });
  return t("book.authorFormat", { name, role: translatedRole });
}
