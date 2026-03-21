import Link from "next/link";

// ─── Thin line-art SVG illustrations ─────────────────────────────
const illustrations = {
  bag: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 20h24l-3 28H23L20 20z" />
      <path d="M26 20c0-6.627 0-8 6-8s6 1.373 6 8" />
      <circle cx="27" cy="32" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="37" cy="32" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  search: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="14" />
      <line x1="38" y1="38" x2="52" y2="52" />
      <path d="M23 24c1.5-2 4-3 6-2.5" />
    </svg>
  ),
  grid: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="18" height="22" rx="2" />
      <rect x="36" y="10" width="18" height="22" rx="2" />
      <rect x="10" y="38" width="18" height="16" rx="2" />
      <rect x="36" y="38" width="18" height="16" rx="2" />
    </svg>
  ),
  orders: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="12" y="8" width="40" height="48" rx="3" />
      <line x1="22" y1="22" x2="42" y2="22" />
      <line x1="22" y1="32" x2="42" y2="32" />
      <line x1="22" y1="42" x2="34" y2="42" />
    </svg>
  ),
  heart: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M32 50S10 36 10 22a12 12 0 0 1 22-6.6A12 12 0 0 1 54 22c0 14-22 28-22 28z" />
    </svg>
  ),
  filter: (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="10" y1="20" x2="54" y2="20" />
      <line x1="18" y1="32" x2="46" y2="32" />
      <line x1="26" y1="44" x2="38" y2="44" />
      <circle cx="26" cy="20" r="4" fill="var(--bg-page)" stroke="currentColor" />
      <circle cx="40" cy="32" r="4" fill="var(--bg-page)" stroke="currentColor" />
      <circle cx="32" cy="44" r="4" fill="var(--bg-page)" stroke="currentColor" />
    </svg>
  ),
};

export type EmptyIllustration = keyof typeof illustrations;

interface EmptyStateProps {
  illustration?: EmptyIllustration;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function EmptyState({
  illustration = "grid",
  title,
  description,
  cta,
  secondaryCta,
  size = "md",
  className = "",
}: EmptyStateProps) {
  const sizeMap = {
    sm: { py: "40px", iconSize: "48px", titleSize: "20px" },
    md: { py: "64px", iconSize: "56px", titleSize: "24px" },
    lg: { py: "96px", iconSize: "64px", titleSize: "30px" },
  };
  const s = sizeMap[size];

  return (
    <div
      className={["empty-state", className].join(" ")}
      style={{ paddingTop: s.py, paddingBottom: s.py }}
      role="status"
      aria-label={title}
    >
      <div
        className="empty-state__icon"
        style={{ width: s.iconSize, height: s.iconSize }}
        aria-hidden="true"
      >
        {illustrations[illustration]}
      </div>

      <h3
        className="empty-state__title"
        style={{ fontSize: s.titleSize }}
      >
        {title}
      </h3>

      {description && (
        <p className="empty-state__desc">{description}</p>
      )}

      {(cta || secondaryCta) && (
        <div className="empty-state__actions">
          {cta &&
            (cta.href ? (
              <Link
                href={cta.href}
                className="btn-primary"
                style={{
                  height: "48px",
                  padding: "0 28px",
                  fontSize: "11px",
                }}
              >
                {cta.label}
              </Link>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{
                  height: "48px",
                  padding: "0 28px",
                  fontSize: "11px",
                }}
                onClick={cta.onClick}
              >
                {cta.label}
              </button>
            ))}
          {secondaryCta &&
            (secondaryCta.href ? (
              <Link
                href={secondaryCta.href}
                className="empty-state__secondary-cta"
              >
                {secondaryCta.label}
              </Link>
            ) : (
              <button
                type="button"
                className="empty-state__secondary-cta"
                onClick={secondaryCta.onClick}
              >
                {secondaryCta.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
