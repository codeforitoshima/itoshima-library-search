# Itoshima Library Search — Spec

## Goal

A modern search frontend for the Itoshima municipal library (lib-itoshima.jp) that proxies
the existing OPAC and presents results without full-page reloads.

## Architecture

- **React Router v7** (SSR) with Vite
- Server-side loader proxies requests to `searchlist.do` on lib-itoshima.jp
- HTML responses parsed with **cheerio** into typed JSON
- Tailwind CSS for styling

## Endpoints

### Library API

`POST https://www.lib-itoshima.jp/WebOpac/webopac/searchlist.do`

Key params: `keyword`, `page`, `count`

### App Routes

- `GET /` — search page
- `GET /?q=KEYWORD&page=N` — search results (SSR)

## Data Model

```ts
type Book = {
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
}
```

## Changelog

- 2026-03-15: Initial implementation — search, pagination, availability badges
