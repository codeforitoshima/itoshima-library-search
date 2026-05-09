// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../../app/i18n";
import Contact, { action } from "../../app/routes/contact";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({}),
    })),
  },
}));

const actionArgs = { params: {}, context: {}, pattern: "", url: new URL("http://localhost/contact") };

function makeRequest(
  fields: Record<string, string>,
  ip = "1.2.3.4"
) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return new Request("http://localhost/contact", {
    method: "POST",
    body: formData,
    headers: { "x-forwarded-for": ip },
  });
}

const validFields = { name: "Ale", email: "a@b.com", message: "Hello" };

describe("contact action — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "testpass";
  });

  it("returns error when name is missing", async () => {
    const request = makeRequest({ ...validFields, name: "" }, "10.0.0.1");
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({
      success: false,
      error: "すべての項目を入力してください。",
    });
  });

  it("returns error when email is missing", async () => {
    const request = makeRequest({ ...validFields, email: "" }, "10.0.0.2");
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({
      success: false,
      error: "すべての項目を入力してください。",
    });
  });

  it("returns error when email format is invalid", async () => {
    const request = makeRequest(
      { ...validFields, email: "notanemail" },
      "10.0.0.3"
    );
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({
      success: false,
      error: "正しいメールアドレスを入力してください。",
    });
  });

  it("returns error when message is missing", async () => {
    const request = makeRequest({ ...validFields, message: "" }, "10.0.0.4");
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({
      success: false,
      error: "すべての項目を入力してください。",
    });
  });

  it("returns error when message exceeds 2000 characters", async () => {
    const request = makeRequest(
      { ...validFields, message: "a".repeat(2001) },
      "10.0.0.5"
    );
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({
      success: false,
      error: "メッセージは2000文字以内で入力してください。",
    });
  });

  it("accepts message of exactly 2000 characters", async () => {
    const request = makeRequest(
      { ...validFields, message: "a".repeat(2000) },
      "10.0.0.6"
    );
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({ success: true });
  });
});

describe("contact action — honeypot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "testpass";
  });

  it("returns success silently when honeypot field is filled", async () => {
    const request = makeRequest(
      { ...validFields, website: "http://spam.com" },
      "10.3.0.1"
    );
    const result = await action({ request, ...actionArgs });
    expect(result).toEqual({ success: true });
    const nodemailer = await import("nodemailer");
    expect(nodemailer.default.createTransport).not.toHaveBeenCalled();
  });
});

describe("contact action — rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "testpass";
  });

  it("blocks a second submission from the same IP within 5 minutes", async () => {
    const ip = "10.1.1.1";
    await action({ request: makeRequest(validFields, ip), ...actionArgs });
    const result = await action({
      request: makeRequest(validFields, ip),
      ...actionArgs,
    });
    expect(result).toEqual({
      success: false,
      error: "送信が多すぎます。しばらくしてからお試しください。",
    });
  });
});

describe("contact action — email sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "testpass";
  });

  it("returns success when all fields are valid and email sends", async () => {
    const result = await action({
      request: makeRequest(validFields, "10.2.0.1"),
      ...actionArgs,
    });
    expect(result).toEqual({ success: true });
  });

  it("returns error when email sending fails", async () => {
    const nodemailer = await import("nodemailer");
    vi.mocked(nodemailer.default.createTransport).mockReturnValueOnce({
      sendMail: vi.fn().mockRejectedValue(new Error("SMTP error")),
    } as never);

    const result = await action({
      request: makeRequest(validFields, "10.2.0.2"),
      ...actionArgs,
    });
    expect(result).toEqual({
      success: false,
      error: "送信に失敗しました。しばらくしてからお試しください。",
    });
  });
});

describe("Contact page", () => {
  function renderContact() {
    const router = createMemoryRouter(
      [{ path: "/:lang/contact", Component: Contact }],
      { initialEntries: ["/ja/contact"] }
    );
    return render(
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    );
  }

  it("renders form fields and disabled submit button", async () => {
    renderContact();
    expect(screen.getByLabelText("名前")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("メッセージ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
  });

  it("shows character counter for message field", async () => {
    renderContact();
    expect(document.body.textContent).toContain("0 / 2000");
  });

  it("shows field error after blur on empty name", async () => {
    renderContact();
    fireEvent.blur(screen.getByLabelText("名前"));
    expect(screen.getByText("名前を入力してください。")).toBeInTheDocument();
  });

  it("enables submit button when all fields are valid", async () => {
    renderContact();
    fireEvent.change(screen.getByLabelText("名前"), {
      target: { value: "Ale" },
    });
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("メッセージ"), {
      target: { value: "Hello" },
    });
    expect(screen.getByRole("button", { name: "送信" })).not.toBeDisabled();
  });
});
