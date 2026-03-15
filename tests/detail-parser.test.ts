import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseBookDetail } from "../app/lib/parser.server";

const fixture = readFileSync(
  join(__dirname, "fixtures/book_detail.html"),
  "utf-8"
);

describe("parseBookDetail", () => {
  const detail = parseBookDetail(fixture);

  it("extracts title", () => {
    expect(detail.title).toBe("愛と小さないのちのトライアングル");
  });

  it("extracts subtitle", () => {
    expect(detail.subtitle).toBe(
      "宮沢賢治・中村哲・高木仁三郎"
    );
  });

  it("extracts author and authorId", () => {
    expect(detail.author).toBe("斎藤/文一／著");
    expect(detail.authorId).toBe("70259");
  });

  it("extracts publisher", () => {
    expect(detail.publisher).toContain("国文社");
  });

  it("extracts year", () => {
    expect(detail.year).toContain("2007");
  });

  it("extracts description", () => {
    expect(detail.description).toContain("小さないのちは生きている");
  });

  it("extracts ISBN from other info", () => {
    expect(detail.isbn).toBe("9784772009478");
  });

  it("extracts availability counts", () => {
    expect(detail.reservations).toBe(0);
    expect(detail.availableCopies).toBe(1);
    expect(detail.lentCopies).toBe(0);
  });

  it("extracts holdings", () => {
    expect(detail.holdings).toHaveLength(1);
    expect(detail.holdings[0].library).toContain("本館");
    expect(detail.holdings[0].status).toBe("貸出できます");
  });

  it("returns empty data for invalid html", () => {
    const empty = parseBookDetail("<html><body></body></html>");
    expect(empty.title).toBe("");
    expect(empty.holdings).toHaveLength(0);
  });
});
