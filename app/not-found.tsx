import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Extreme Dept Kidz",
};

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__inner container-luxury">
        <div className="not-found__number" aria-hidden="true">
          404
        </div>

        <h1 className="not-found__title">
          This page has left the building.
        </h1>
        <p className="not-found__desc">
          The page you&apos;re looking for may have moved, been renamed, or
          never existed. Let&apos;s get you back to something good.
        </p>

        <div className="not-found__actions">
          <Link
            href="/"
            className="btn-primary"
            style={{ height: "52px", padding: "0 32px", fontSize: "12px" }}
          >
            Back to Home
          </Link>
          <Link
            href="/collections/all"
            className="btn-secondary"
            style={{ height: "52px", padding: "0 32px", fontSize: "12px" }}
          >
            Shop All
          </Link>
        </div>

        <div className="not-found__links">
          <p className="not-found__links-label">
            You might be looking for:
          </p>
          <div className="not-found__links-row">
            {[
              { label: "Boys Collection", href: "/collections/boys" },
              { label: "Girls Collection", href: "/collections/girls" },
              { label: "New Arrivals", href: "/collections/new-arrivals" },
              { label: "Contact Us", href: "/contact" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="not-found__link">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
