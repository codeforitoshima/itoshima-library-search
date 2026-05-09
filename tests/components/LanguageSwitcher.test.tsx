// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { LanguageSwitcher } from "../../app/components/LanguageSwitcher";
import { withI18n } from "../test-utils";

function renderSwitcher(lang = "ja") {
  return render(
    withI18n(
      <MemoryRouter initialEntries={[`/${lang}/`]}>
        <Routes>
          <Route path="/:lang/*" element={<LanguageSwitcher />} />
        </Routes>
      </MemoryRouter>
    )
  );
}

describe("LanguageSwitcher", () => {
  it("only renders options for languages with loaded resources", () => {
    renderSwitcher("ja");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(14);
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual([
      "ja", "id", "de", "en", "es", "tl", "fr", "it", "vi", "my", "ne", "ko", "zh-TW", "zh-CN",
    ]);
  });

  it("shows the current language as selected", () => {
    renderSwitcher("ja");
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("ja");
  });
});
