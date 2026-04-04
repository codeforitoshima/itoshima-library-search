import { useState } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import nodemailer from "nodemailer";
import { Footer } from "~/components/Footer";
import { ThemeToggle } from "~/components/ThemeToggle";
import { BookIcon } from "~/components/BookIcon";

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
    { title: "お問い合わせ | 糸島図書館 非公式検索" },
    {
      name: "description",
      content: "Code for Itoshimaへのお問い合わせフォーム",
    },
  ];
}

export async function action({ request }: ActionFunctionArgs) {
  const ip = getClientIp(request);
  const lastSent = rateLimitMap.get(ip) ?? 0;
  if (Date.now() - lastSent < RATE_LIMIT_MS) {
    return {
      success: false,
      error: "送信が多すぎます。しばらくしてからお試しください。",
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
    return { success: false, error: "すべての項目を入力してください。" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      error: "正しいメールアドレスを入力してください。",
    };
  }
  if (message.length > MESSAGE_MAX_LENGTH) {
    return {
      success: false,
      error: `メッセージは${MESSAGE_MAX_LENGTH}文字以内で入力してください。`,
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
      error: "送信に失敗しました。しばらくしてからお試しください。",
    };
  }
}

type FieldValues = { name: string; email: string; message: string };
type FieldErrors = { name: string; email: string; message: string };

function validate(values: FieldValues): FieldErrors {
  const errors: FieldErrors = { name: "", email: "", message: "" };
  if (!values.name.trim()) {
    errors.name = "名前を入力してください。";
  }
  if (!values.email.trim()) {
    errors.email = "メールアドレスを入力してください。";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "正しいメールアドレスを入力してください。";
  }
  if (!values.message.trim()) {
    errors.message = "メッセージを入力してください。";
  } else if (values.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `メッセージは${MESSAGE_MAX_LENGTH}文字以内で入力してください。`;
  }
  return errors;
}

export default function Contact() {
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

  const errors = validate(values);
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
          <Link to="/">
            <BookIcon className="header-icon" />
            糸島図書館 非公式検索
          </Link>
        </h1>
        <ThemeToggle />
      </header>

      <article className="contact-page">
        <h2>お問い合わせ</h2>

        {actionData?.success ? (
          <div className="contact-success">
            <p>送信しました。ありがとうございます。</p>
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
                名前
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
                メールアドレス
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
                メッセージ
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
              {isSubmitting ? "送信中..." : "送信"}
            </button>
          </Form>
        )}
      </article>
      <Footer />
    </main>
  );
}
