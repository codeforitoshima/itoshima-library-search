import { describe, it, expect } from "vitest";
import { isValidLang, SUPPORTED_LANGS } from "../app/i18n";

describe("isValidLang", () => {
  it("returns true for every supported language code", () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(isValidLang(lang)).toBe(true);
    }
  });

  it("returns false for an unknown language code", () => {
    expect(isValidLang("xx")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidLang("")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidLang(undefined)).toBe(false);
  });

  it("returns false for a partial match", () => {
    expect(isValidLang("j")).toBe(false);
    expect(isValidLang("zh")).toBe(false);
  });
});
