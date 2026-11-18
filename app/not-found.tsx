import Link from "next/link";

export default function NotFound() {
  return (
    <main className="tui-page">
      <div className="tui-shell tui-notfound">
        <pre className="tui-ascii" aria-hidden="true">
          {String.raw` _  _    ___  _  _
| || |  / _ \| || |
| || |_| | | | || |_
|__   _| |_| |__   _|
   |_|  \___/   |_|`}
        </pre>
        <h1 className="tui-error">bash: 404: page not found</h1>
        <p className="tui-muted">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href="/" className="tui-button tui-button-primary">
          cd ~
        </Link>
      </div>
    </main>
  );
}
