import Link from "next/link";

// ─── Custom SVG icons — thin 1.5px stroke, luxury line style ─────
const TruckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
    <rect x="9" y="11" width="14" height="10" rx="2" />
    <circle cx="12" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
  </svg>
);
const ReturnIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const StarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TRUST_ITEMS = [
  {
    icon: <TruckIcon />,
    title: "Free Shipping",
    desc: "On orders over GHS ₵500",
    href: "/shipping-info",
  },
  {
    icon: <ReturnIcon />,
    title: "30-Day Returns",
    desc: "Easy, hassle-free returns",
    href: "/returns-exchange",
  },
  {
    icon: <ShieldIcon />,
    title: "Secure Checkout",
    desc: "Your data is protected",
    href: null,
  },
  {
    icon: <StarIcon />,
    title: "Premium Quality",
    desc: "Crafted to last",
    href: null,
  },
];

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Why shop with us">
      <div className="container-luxury">
        <ul className="trust-bar__list" role="list">
          {TRUST_ITEMS.map((item) => (
            <li key={item.title} className="trust-bar__item">
              {item.href != null ? (
                <Link
                  href={item.href}
                  className="trust-bar__inner trust-bar__inner--link"
                >
                  <span className="trust-bar__icon">{item.icon}</span>
                  <span className="trust-bar__text">
                    <span className="trust-bar__title">{item.title}</span>
                    <span className="trust-bar__desc">{item.desc}</span>
                  </span>
                </Link>
              ) : (
                <div className="trust-bar__inner">
                  <span className="trust-bar__icon">{item.icon}</span>
                  <span className="trust-bar__text">
                    <span className="trust-bar__title">{item.title}</span>
                    <span className="trust-bar__desc">{item.desc}</span>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
