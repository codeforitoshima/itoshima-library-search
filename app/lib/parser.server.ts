import * as cheerio from "cheerio";

export type Book = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorId: string;
  publisher: string;
  year: string;
  type: string;
  isbn: string;
  available: boolean;
};

export type SearchResults = {
  total: number;
  page: number;
  totalPages: number;
  books: Book[];
};

export function parseSearchResults(html: string): SearchResults {
  const $ = cheerio.load(html);

  const extractLabelText = (
    $lis: cheerio.Cheerio<cheerio.Element>,
    label: string
  ): string => {
    const li = $lis
      .filter((_i, el) => $(el).text().startsWith(label))
      .first();
    return li.text().replace(label, "").trim();
  };

  const metaText = $(".displayCondition").first().text();
  const totalMatch = metaText.match(/検索結果【(\d+)】/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;

  const pageMatch = metaText.match(/\((\d+)\/(\d+)ページ\)/);
  const page = pageMatch ? parseInt(pageMatch[1], 10) : 1;
  const totalPages = pageMatch ? parseInt(pageMatch[2], 10) : 1;

  const books: Book[] = [];

  $("#sheet .bookcard_temp").each((_i, el) => {
    const $card = $(el);

    const wrapperEl = $card.find('div[id^="bookcard_item_"]').first();
    const wrapperId = wrapperEl.attr("id") ?? "";
    const id = wrapperId.replace("bookcard_item_", "");

    const title = $card.find("h3").first().text().trim();
    const subtitle = $card.find("h4").first().text().trim();

    const $lis = $card.find("ul li");

    const authorLi = $lis
      .filter((_i, li) => $(li).text().startsWith("著者："))
      .first();
    const authorLink = authorLi.find("a").first();
    const author = authorLink.text().trim();
    const authorHref = authorLink.attr("href") ?? "";
    const authorIdMatch = authorHref.match(/list_author\('(\d+)'\)/);
    const authorId = authorIdMatch ? authorIdMatch[1] : "";

    const publisher = extractLabelText($lis, "出版者：");
    const year = extractLabelText($lis, "出版年：");
    const type = extractLabelText($lis, "資料種別：");

    const imgEl = $card.find('img[id^="img_"]').first();
    const imgId = imgEl.attr("id") ?? "";
    const isbn = imgId.replace("img_", "");

    const available = $card.find(".bookcard_situation").length === 0;

    books.push({
      id,
      title,
      subtitle,
      author,
      authorId,
      publisher,
      year,
      type,
      isbn,
      available,
    });
  });

  return { total, page, totalPages, books };
}
