# Itoshima Library Search — Spec

## Goal

A modern search frontend for the Itoshima municipal library (lib-itoshima.jp) that proxies
the existing OPAC and presents results without full-page reloads.

## Architecture

- **React Router v7** (SSR) with Vite
- Server-side loader proxies requests to `searchlist.do` on lib-itoshima.jp
- HTML responses parsed with **cheerio** into typed JSON
- Tailwind CSS for styling
- New routes must be registered in `app/routes.ts` in addition to creating the route file
- `vite.config.ts` includes a `forward-host-header` plugin that works around a React Router v7 CSRF check: in development with HTTPS (mkcert), the browser uses HTTP/2 where the `host` header is replaced by `:authority`. React Router needs `x-forwarded-host` or `host` to validate actions; the plugin injects `x-forwarded-host` into the raw request before React Router processes it. This only runs in the dev server (`configureServer`), not in production.

## Contact Form

- Route: `POST /contact` handled by a React Router `action` in `app/routes/contact.tsx`
- Email sent via **Nodemailer** using Gmail SMTP (`smtp.gmail.com:587`, STARTTLS)
- Credentials in env vars: `SMTP_USER`, `SMTP_PASS` (Google Workspace App Password)
- Server-side protections: honeypot field (`website`), rate limiting (1 per IP per 5 min), email regex, message max 2000 chars
- Client-side: controlled form with per-field validation on blur, submit disabled until all fields valid, character counter on textarea

## Endpoints

### Library API

`POST https://www.lib-itoshima.jp/WebOpac/webopac/searchlist.do`

Key params: `keyword`, `page`, `count`

### Library API — Detail

`POST https://www.lib-itoshima.jp/WebOpac/webopac/searchdetail.do`

Requires a `JSESSIONID` session cookie (established via a prior `searchlist.do` call).
Key params: `biblioid`, `count=999`, `screen=142`, `histnum=2`, `listtype=0`

### App Routes

- `GET /` — search page
- `GET /?q=KEYWORD&page=N` — search results (SSR)
- `GET /book/:id` — book detail page (SSR)
- `GET /about` — about page
- `GET /contact` — contact form (SSR)
- `POST /contact` — contact form submission (sends email via Nodemailer + Gmail SMTP)
- `GET /api/floormap?biblioid=X&lcdcd=Y&doclno=Z&displcs=W` — floor map data (JSON)

### Library API — Floor Map

`POST https://www.lib-itoshima.jp/WebOpac/webopac/searchdetailplace.do`

Requires a `JSESSIONID` session cookie.
Key params: `biblioid`, `dispHaikaLcsCd` (library code), `docLno` (document number), `displcs` (library name)

Returns HTML with a floor plan background image and JavaScript that positions red star markers
on a 40×23 grid overlay (640×368px image). Not all holdings have floor maps — 閉架 (closed stacks)
and some libraries don't provide them.

### External APIs (client-side)

- Google Books Volumes API — lazy cover thumbnail resolution per ISBN

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

type BookDetail = {
  title: string;
  subtitle: string;
  author: string;
  authorId: string;
  publisher: string;
  year: string;
  description: string;
  otherInfo: string;
  isbn: string;
  reservations: number;
  availableCopies: number;
  lentCopies: number;
  holdings: Holding[];
}

type Holding = {
  library: string;
  type: string;
  location: string;
  status: string;
  materialNo: string;
  floorMapParams?: {
    lcdcd: string;
    doclno: string;
    displcs: string;
  };
}
```

## Changelog

- 2026-03-15: Initial implementation — search, pagination, availability badges
- 2026-03-15: Add book cover thumbnails (client-side Google Books API), detail pages with holdings
- 2026-03-15: Add unofficial branding, disclaimer footer, OG meta tags, robots.txt, PWA manifest, favicon, MIT license
- 2026-03-17: Add inline floor map on detail page showing book shelf location
- 2026-03-17: Add test coverage for fetch functions (HTTP mock) and React components (jsdom + testing-library)
- 2026-03-27: Add ShareButton component — Web Share API on iOS/Android, clipboard fallback on other browsers; added to book detail and search results pages
- 2026-04-04: Add ObfuscatedEmailLink component — builds mailto: and display text at runtime via JS, no static HTML exposure; added to About page
- 2026-04-04: Add contact form at /contact — Nodemailer + Gmail SMTP (App Password), fields: name, reply-to email, message; linked from footer and About page
