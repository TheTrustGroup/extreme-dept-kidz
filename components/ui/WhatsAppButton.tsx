"use client";

import { usePathname } from "next/navigation";

const PLACEHOLDER_PHONES = new Set(["233000000000", "0000000000"]);

function buildWhatsAppHref(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  if (typeof envUrl === "string" && envUrl.length > 0) {
    return envUrl;
  }

  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";
  const digits = raw.replace(/\D/g, "");
  if (!digits || PLACEHOLDER_PHONES.has(digits)) {
    return null;
  }

  const message = encodeURIComponent(
    "Hi! I'm interested in a product from Extreme Dept Kidz."
  );
  return `https://wa.me/${digits}?text=${message}`;
}

export default function WhatsAppButton(): JSX.Element | null {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const href = buildWhatsAppHref();
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-fab"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0z" />
      </svg>
    </a>
  );
}
