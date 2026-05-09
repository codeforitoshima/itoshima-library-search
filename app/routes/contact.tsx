import { useState } from "react";
import { Form, Link, useActionData, useNavigation, useParams } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import nodemailer from "nodemailer";
import { Footer } from "~/components/Footer";
import { ThemeToggle } from "~/components/ThemeToggle";
import { BookIcon } from "~/components/BookIcon";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import i18n from "~/i18n";

const MESSAGE_MAX_LENGTH = 2000;
const RATE_LIMIT_MS = 5 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rateLimitMap = new Map<string, number>();

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export function meta() {
  return [
    { title: `${i18n.t("contact.title")} | ${i18n.t("meta.siteTitle")}` },
    {
      name: "description",
      content: i18n.t("contact.metaDesc"),
    },
  ];
}

export async function action({ request }: ActionFunctionArgs) {
  const ip = getClientIp(request);
  const lastSent = rateLimitMap.get(ip) ?? 0;
  if (Date.now() - lastSent < RATE_LIMIT_MS) {
    return {
      success: false,
      error: i18n.t("contact.errorRateLimit"),
    };
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const honeypot = String(formData.get("website") ?? "");
  if (honeypot) {
    return { success: true };
  }

  if (!name || !email || !message) {
    return { success: false, error: i18n.t("contact.errorRequired") };
  }
  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      error: i18n.t("contact.errorEmail"),
    };
  }
  if (message.length > MESSAGE_MAX_LENGTH) {
    return {
      success: false,
      error: i18n.t("contact.errorLength"),
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `糸島図書館サイトへのお問い合わせ（${name}）`,
      text: `名前: ${name}\nメール: ${email}\n\n${message}`,
    });

    rateLimitMap.set(ip, Date.now());
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: i18n.t("contact.errorServer"),
    };
  }
}

type FieldValues = { name: string; email: string; message: string };
type FieldErrors = { name: string; email: string; message: string };

function validate(values: FieldValues, t: (key: string) => string): FieldErrors {
  const errors: FieldErrors = { name: "", email: "", message: "" };
  if (!values.name.trim()) {
    errors.name = t("contact.validationName");
  }
  if (!values.email.trim()) {
    errors.email = t("contact.validationEmail");
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = t("contact.errorEmail");
  }
  if (!values.message.trim()) {
    errors.message = t("contact.validationMessage");
  } else if (values.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = t("contact.errorLength");
  }
  return errors;
}

export default function Contact() {
  const { lang = "ja" } = useParams();
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [values, setValues] = useState<FieldValues>({
    name: "",
    email: "",
    message: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const errors = validate(values, t);
  const isValid = !errors.name && !errors.email && !errors.message;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>
          <Link to={`/${lang}`}>
            <BookIcon className="header-icon" />
            {t("header.title")}
          </Link>
        </h1>
        <div className="header-controls">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <article className="contact-page">
        <h2>{t("contact.title")}</h2>

        {actionData?.success ? (
          <div className="contact-success">
            <p>{t("contact.success")}</p>
          </div>
        ) : (
          <Form method="post" className="contact-form">
            {actionData?.error && (
              <div className="contact-error">
                <p>{actionData.error}</p>
              </div>
            )}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="contact-honeypot"
              aria-hidden="true"
            />
            <div className="contact-field">
              <label htmlFor="name" className="contact-label">
                {t("contact.name")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="contact-input"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.name && errors.name && (
                <p className="contact-field-error">{errors.name}</p>
              )}
            </div>
            <div className="contact-field">
              <label htmlFor="email" className="contact-label">
                {t("contact.email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="contact-input"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <p className="contact-field-error">{errors.email}</p>
              )}
            </div>
            <div className="contact-field">
              <label htmlFor="message" className="contact-label">
                {t("contact.message")}
              </label>
              <textarea
                id="message"
                name="message"
                className="contact-input contact-textarea"
                rows={6}
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="contact-char-count">
                <span
                  className={
                    values.message.length > MESSAGE_MAX_LENGTH
                      ? "contact-char-over"
                      : ""
                  }
                >
                  {values.message.length}
                </span>
                {" / "}
                {MESSAGE_MAX_LENGTH}
              </div>
              {touched.message && errors.message && (
                <p className="contact-field-error">{errors.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="search-button contact-submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? t("contact.submitting") : t("contact.submit")}
            </button>
          </Form>
        )}
      </article>
      <Footer lang={lang} />
    </main>
  );
}
