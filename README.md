# 糸島図書館 非公式検索

糸島市立図書館のモダンな非公式検索フロントエンドです。
図書館の**公式サイトではありません** — 利用者によるコミュニティツールです。
公式サイトは [lib-itoshima.jp](https://www.lib-itoshima.jp/WebOpac/webopac/selectsearch.do) です。

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm dev
```

[http://localhost:5173](http://localhost:5173) を開いてください。

同じ Wi-Fi 上のモバイル端末からもローカル IP アドレスでアクセスできます（`server.host: true` が有効）。

HTTPS が必要な場合（iOS の Web Share API など）は `vite-plugin-mkcert` が自動でローカル証明書を生成します。
初回起動時にパスワードを求められます。iPhone からアクセスする場合は `~/.vite-plugin-mkcert/cert.pem`
を AirDrop で転送し、iOS の「設定 → 一般 → VPN とデバイス管理」からインストール・信頼設定を行ってください。

## テスト

```bash
pnpm test
```

## ビルド・本番環境

```bash
pnpm build
pnpm start
```

## 仕組み

図書館の WebOPAC システムへの検索リクエストをサーバーサイドでプロキシし
（React Router の loader 経由）、HTML レスポンスを cheerio でパースして
モダンな React UI で表示します。URL は共有可能です — 例: `/?q=宮沢賢治&page=2`

表紙は [Google Books API](https://developers.google.com/books/docs/v1/using#PerformingSearch)
を使い、ISBN をもとにクライアントサイドで取得します。
すべての本に表紙があるわけではありません。
