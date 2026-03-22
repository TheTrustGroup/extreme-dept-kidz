import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { searchProducts } from "@/lib/data/products";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

function getQuery(sp: Props["searchParams"]): string {
  const raw = sp.q;
  const s = Array.isArray(raw) ? raw[0] : raw;
  return (s ?? "").trim();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = getQuery(searchParams);
  const title = q ? `Search: ${q} | Extreme Dept Kidz` : "Search | Extreme Dept Kidz";
  return {
    title,
    description: "Search Extreme Dept Kidz for premium kids streetwear.",
    robots: { index: false, follow: true },
  };
}

function formatPriceCedis(cents: number): string {
  const n = cents / 100;
  return `₵${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function SearchPage({ searchParams }: Props): Promise<JSX.Element> {
  const q = getQuery(searchParams);
  const tooShort = q.length > 0 && q.length < 2;
  const results = !tooShort && q.length >= 2 ? await searchProducts(q, { storefrontOnly: true }) : [];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20 pt-[calc(var(--topbar-height,0px)+72px)] md:pt-[calc(var(--topbar-height,0px)+80px)]">
      <Container size="lg">
        <header className="mb-10 border-b border-[var(--border-default)] pb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-normal text-[var(--text-primary)] tracking-tight">
            Search
          </h1>
          {q ? (
            <p className="mt-2 text-body-sm text-[var(--text-secondary)]">
              Results for &ldquo;{q}&rdquo;
              {tooShort && (
                <span className="ml-2 text-[var(--color-gold)]">
                  — enter at least 2 characters
                </span>
              )}
            </p>
          ) : (
            <p className="mt-2 text-body-sm text-[var(--text-secondary)]">
              Use the search box in the header or menu. Minimum query length is 2 characters.
            </p>
          )}
        </header>

        {tooShort && (
          <p className="text-[var(--text-secondary)] text-center py-12">
            Type at least two characters to search.
          </p>
        )}

        {!tooShort && q.length >= 2 && results.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] py-16">
            No products match your search. Try different keywords or browse{" "}
            <Link href="/collections/all" className="text-[var(--color-navy)] underline underline-offset-2">
              all products
            </Link>
            .
          </p>
        )}

        {results.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group flex gap-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 transition-colors hover:border-[var(--color-gold)]"
                >
                  <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-md bg-[var(--bg-surface-2)]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="text-label text-[var(--text-tertiary)]">{p.category}</span>
                    <span className="font-[family-name:var(--font-montserrat)] text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)] group-hover:text-[var(--color-navy)] line-clamp-2">
                      {p.name}
                    </span>
                    <span className="mt-1 text-price text-[var(--text-primary)]">
                      {formatPriceCedis(p.price)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
