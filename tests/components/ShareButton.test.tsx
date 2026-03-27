// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ShareButton } from "../../app/components/ShareButton";

describe("ShareButton — navigator.share available", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockResolvedValue(undefined),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    // biome-ignore lint/performance/noDelete: cleaning up test mock
    delete (navigator as unknown as Record<string, unknown>).share;
  });

  it("renders a share button after mount", async () => {
    render(<ShareButton title="テスト書籍" />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "シェアする" })).toBeInTheDocument()
    );
  });

  it("calls navigator.share with formatted title and current URL on click", async () => {
    render(<ShareButton title="テスト書籍" />);
    const button = await screen.findByRole("button", { name: "シェアする" });
    fireEvent.click(button);
    expect(navigator.share).toHaveBeenCalledWith({
      title: "テスト書籍 | 糸島図書館 非公式検索",
      url: window.location.href,
    });
  });
});

describe("ShareButton — navigator.share not available", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  it("renders a copy button when navigator.share is unavailable", async () => {
    render(<ShareButton title="テスト書籍" />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "URLをコピー" })).toBeInTheDocument()
    );
  });

  it("calls navigator.clipboard.writeText with current URL on click", async () => {
    render(<ShareButton title="テスト書籍" />);
    const button = await screen.findByRole("button", { name: "URLをコピー" });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("shows copied feedback after clicking", async () => {
    render(<ShareButton title="テスト書籍" />);
    const button = await screen.findByRole("button", { name: "URLをコピー" });
    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "コピーしました" })).toBeInTheDocument()
    );
  });
});
