import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "~/locales/ja.json";
import zhTW from "~/locales/zh-TW.json";
import zhCN from "~/locales/zh-CN.json";

export const SUPPORTED_LANGS = [
  "ja", "zh-TW", "zh-CN", "ko", "vi", "id", "my", "tl",
  "en", "es", "it", "fr", "de", "ne",
] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export function isValidLang(lang: string | undefined): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang);
}

function detectLang(): string {
  if (typeof window === "undefined") return "ja";
  const segment = window.location.pathname.split("/")[1];
  return isValidLang(segment) ? segment : "ja";
}

const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: detectLang(),
  fallbackLng: "ja",
  resources: {
    ja: { translation: ja },
    "zh-TW": { translation: zhTW },
    "zh-CN": { translation: zhCN },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
