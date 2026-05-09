import { Link, useParams } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { Footer } from "~/components/Footer";
import { ThemeToggle } from "~/components/ThemeToggle";
import { BookIcon } from "~/components/BookIcon";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import i18n from "~/i18n";

export function meta() {
  return [
    { title: `${i18n.t("about.title")} | ${i18n.t("meta.siteTitle")}` },
    { name: "description", content: i18n.t("about.metaDesc") },
  ];
}

export default function About() {
  const { lang = "ja" } = useParams();
  const { t } = useTranslation();

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>
          <Link to={`/${lang}`}><BookIcon className="header-icon" />{t("header.title")}</Link>
        </h1>
        <div className="header-controls">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <article className="about-page">
        <h2>{t("about.title")}</h2>

        <section className="about-section">
          <p>{t("about.intro")}</p>
          <ul className="about-features">
            <li>{t("about.feature1")}</li>
            <li>{t("about.feature2")}</li>
            <li>{t("about.feature3")}</li>
          </ul>
          <p>
            <Trans
              i18nKey="about.officialDisclaimer"
              components={{
                lnk: (
                  <a
                    href="https://itoshima.libweb.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          </p>
        </section>

        <section className="about-section">
          <h3>{t("about.features")}</h3>
          <ul className="about-checklist">
            <li>{t("about.opensource")}</li>
            <li>{t("about.noCookies")}</li>
            <li>{t("about.noPersonalData")}</li>
            <li>{t("about.noAds")}</li>
            <li>{t("about.free")}</li>
            <li>{t("about.nonprofit")}</li>
          </ul>
        </section>

        <section className="about-section about-cfi">
          <div>
            <h3>{t("about.cfiTitle")}</h3>
            <p>{t("about.cfiDesc")}</p>
            <p>
              <a
                href="https://github.com/codeforitoshima/itoshima-library-search"
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                codeforitoshima/itoshima-library-search
              </a>
            </p>
            <p>
              <Link to={`/${lang}/contact`} className="github-link">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M1.5 2h13A1.5 1.5 0 0 1 16 3.5v9A1.5 1.5 0 0 1 14.5 14h-13A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2zm0 1a.5.5 0 0 0-.5.5v.77l7 4.2 7-4.2V3.5a.5.5 0 0 0-.5-.5h-13zM15 5.64l-6.54 3.93a.75.75 0 0 1-.92 0L1 5.64V12.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V5.64z" />
                </svg>
                {t("nav.contact")}
              </Link>
            </p>
          </div>
          <img src="/code-for-itoshima.png" alt={t("about.cfiLogoAlt")} className="about-cfi-logo" />
        </section>
      </article>
      <Footer lang={lang} />
    </main>
  );
}
