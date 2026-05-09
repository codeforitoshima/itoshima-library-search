import { useEffect } from "react";
import { data, Outlet, useLoaderData } from "react-router";
import { I18nextProvider } from "react-i18next";
import i18n, { isValidLang } from "~/i18n";
import type { Route } from "./+types/$lang";

export async function loader({ params }: Route.LoaderArgs) {
  const lang = params.lang;
  if (!isValidLang(lang)) {
    throw new Response("Not Found", { status: 404 });
  }
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  return data({ lang });
}

export default function LangLayout() {
  const { lang } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <Outlet />
    </I18nextProvider>
  );
}
