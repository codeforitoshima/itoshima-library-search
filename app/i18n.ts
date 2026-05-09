import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "~/locales/ja.json";
import id from "~/locales/id.json";
import de from "~/locales/de.json";
import en from "~/locales/en.json";
import es from "~/locales/es.json";
import tl from "~/locales/tl.json";
import fr from "~/locales/fr.json";
import it from "~/locales/it.json";
import my from "~/locales/my.json";
import ne from "~/locales/ne.json";
import ko from "~/locales/ko.json";
import zhTW from "~/locales/zh-TW.json";
import zhCN from "~/locales/zh-CN.json";
import vi from "~/locales/vi.json";

// Order: Japanese first, then alphabetical by display name
export const SUPPORTED_LANGS = [
  "ja", "id", "de", "en", "es", "tl", "fr", "it", "vi", "my", "ne", "ko", "zh-TW", "zh-CN",
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
    id: { translation: id },
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    tl: { translation: tl },
    fr: { translation: fr },
    it: { translation: it },
    my: { translation: my },
    ne: { translation: ne },
    ko: { translation: ko },
    "zh-TW": { translation: zhTW },
    "zh-CN": { translation: zhCN },
    vi: { translation: vi },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
