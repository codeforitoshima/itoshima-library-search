export function Footer() {
  return (
    <footer className="app-footer">
      <p>
        このサイトは糸島市立図書館の公式サイトではありません。
      </p>
      <p>
        図書館の公式サイトは{" "}
        <a
          href="https://www.lib-itoshima.jp/WebOpac/webopac/selectsearch.do"
          target="_blank"
          rel="noopener noreferrer"
        >
          lib-itoshima.jp
        </a>{" "}
        です。
      </p>
      <p>
        <a
          href="https://github.com/codeforitoshima/itoshima-library-search"
          target="_blank"
          rel="noopener noreferrer"
        >
          ソースコード
        </a>
      </p>
    </footer>
  );
}
