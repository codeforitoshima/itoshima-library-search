import { describe, it, expect } from "vitest";
import { loader } from "../../app/routes/$lang";

function makeArgs(lang: string) {
  return {
    params: { lang },
    request: new Request(`http://localhost/${lang}/`),
    context: {},
  };
}

describe("$lang loader", () => {
  it("returns lang data for a valid language", async () => {
    const result = await loader(makeArgs("ja") as never);
    expect((result as { data: unknown }).data).toMatchObject({ lang: "ja" });
  });

  it("throws a 404 Response for an unknown language code", async () => {
    await expect(loader(makeArgs("xx") as never)).rejects.toSatisfy(
      (e: unknown) => e instanceof Response && e.status === 404
    );
  });

  it("throws a 404 Response for an empty lang param", async () => {
    await expect(loader(makeArgs("") as never)).rejects.toSatisfy(
      (e: unknown) => e instanceof Response && e.status === 404
    );
  });
});
