import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "~/locales/ja.json";
import zhTW from "~/locales/zh-TW.json";
import zhCN from "~/locales/zh-CN.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import it from "~/locales/it.json";
import fr from "~/locales/fr.json";
import de from "~/locales/de.json";

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
    en: { translation: en },
    es: { translation: es },
    it: { translation: it },
    fr: { translation: fr },
    de: { translation: de },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
