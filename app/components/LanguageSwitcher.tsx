import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGS, type Lang } from "~/i18n";

export function LanguageSwitcher() {
  const { lang = "ja" } = useParams<{ lang: Lang }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const availableLangs = SUPPORTED_LANGS.filter((code) =>
    i18n.hasResourceBundle(code, "translation")
  );

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value;
    const segments = location.pathname.split("/");
    segments[1] = newLang;
    navigate(segments.join("/") + location.search);
  }

  return (
    <div className="lang-switcher-wrapper">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className="lang-switcher-label hidden sm:inline">{t(`lang.${lang}`)}</span>
      <select
        className="lang-switcher"
        value={lang}
        onChange={handleChange}
        aria-label={t("lang.switcherLabel", "言語 / Language")}
      >
        {availableLangs.map((code) => (
          <option key={code} value={code}>
            {t(`lang.${code}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
