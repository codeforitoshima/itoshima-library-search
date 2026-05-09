import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  title: string;
};

export function ShareButton({ title }: Props) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canShare =
    mounted &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  function handleShare() {
    navigator
      .share({
        title: `${title} | ${t("meta.siteTitle")}`,
        url: window.location.href,
      })
      .catch(() => {});
  }

  function handleCopy() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => copyViaExecCommand(url));
    } else {
      copyViaExecCommand(url);
    }
  }

  function copyViaExecCommand(url: string) {
    const el = document.createElement("textarea");
    el.value = url;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (canShare) {
    return (
      <button
        type="button"
        className="share-button"
        onClick={handleShare}
        aria-label={t("share.share")}
      >
        {t("share.share")}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="share-button"
      onClick={handleCopy}
      aria-label={copied ? t("share.copied") : t("share.copyUrl")}
    >
      {copied ? `${t("share.copied")} ✓` : t("share.copyUrl")}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}
