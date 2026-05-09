import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "~/locales/ja.json";

export const SUPPORTED_LANGS = [
  "ja", "zh-TW", "zh-CN", "ko", "vi", "id", "my", "tl",
  "en", "es", "it", "fr", "de", "ne",
] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export function isValidLang(lang: string | undefined): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang);
}

const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: "ja",
  fallbackLng: "ja",
  initImmediate: false,
  resources: {
    ja: { translation: ja },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
