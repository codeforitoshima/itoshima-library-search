const SEARCH_URL =
  "https://www.lib-itoshima.jp/WebOpac/webopac/searchlist.do";

export async function fetchSearchResults(
  keyword: string,
  page = 1,
  count = 10
): Promise<string> {
  const body = new URLSearchParams({
    page: String(page),
    count: String(count),
    keyword,
    keyflg: "and",
    author: "",
    autflg: "and",
    authorid: "",
    publiy1: "",
    publiy2: "",
    publiy3: "",
    publiy4: "",
    allcount: "",
    title: "",
    titflg: "",
    publish: "",
    pubflg: "",
    publishid: "",
    isbn: "",
    bunrui: "",
    bunruicode: "",
    recommend: "",
    syubetu: "",
    prize: "",
    przflg: "",
    nasflg: "",
    seiky1: "",
    kanflg: "",
    media: "",
    order: "",
    man: "",
  });

  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:148.0) Gecko/20100101 Firefox/148.0",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Library search failed: ${response.status}`);
  }

  return response.text();
}
