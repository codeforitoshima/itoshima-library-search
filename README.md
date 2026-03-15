# Itoshima Library Search (非公式)

Modern, unofficial search frontend for the Itoshima municipal library (糸島市立図書館).
This is **not** an official product of the library — it's a community tool by active users.
The official library site is [lib-itoshima.jp](https://www.lib-itoshima.jp/WebOpac/webopac/selectsearch.do).

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tests

```bash
pnpm test
```

## Build & Production

```bash
pnpm build
pnpm start
```

## How it works

The app proxies search requests to the library's WebOPAC system server-side
(via React Router loaders), parses the HTML responses with cheerio, and renders
results as a modern React UI. URLs are shareable — e.g. `/?q=宮沢賢治&page=2`.

Book cover thumbnails are loaded client-side via the
[Google Books API](https://developers.google.com/books/docs/v1/using#PerformingSearch)
by ISBN. Not every book has a cover — Japanese-only titles often don't.
