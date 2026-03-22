"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MessageCircle, Phone } from "lucide-react";

function OrderSuccessInner() {
  const p = useSearchParams();
  const ref = p.get("ref") || "";
  const name = p.get("name") || "there";

  const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "233000000000";
  const waMsg = encodeURIComponent(
    `Hi Extreme Dept Kidz! I just placed order ${ref}. ` +
      `Please confirm my delivery details.`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        backgroundColor: "var(--bg-page)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "#22c55e",
          }}
        >
          <CheckCircle size={36} strokeWidth={1.5} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(24px, 6vw, 32px)",
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: "0 0 12px",
            lineHeight: 1.15,
          }}
        >
          Order placed, <em>{name}.</em>
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          Thank you for shopping with Extreme Dept Kidz.
        </p>

        {ref && (
          <div
            style={{
              display: "inline-block",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              padding: "8px 20px",
              margin: "12px 0 28px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Order Reference
            </span>
            <span
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--text-primary)",
              }}
            >
              {ref}
            </span>
          </div>
        )}

        <div
          style={{
            border: "1px solid var(--border-default)",
            padding: "20px",
            marginBottom: 28,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              margin: "0 0 16px",
            }}
          >
            What happens next
          </p>
          {[
            {
              icon: <Phone size={14} />,
              title: "We will call you",
              body: "Our team will contact you to confirm your delivery address and timing.",
            },
            {
              icon: <CheckCircle size={14} />,
              title: "We prepare your order",
              body: "Your items will be carefully packed and prepared for delivery.",
            },
            {
              icon: <MessageCircle size={14} />,
              title: "Delivery & payment",
              body: "Pay cash when your order arrives at your door.",
            },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-navy)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 3px",
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "stretch",
          }}
        >
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 52,
              background: "#25D366",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "var(--font-montserrat)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <MessageCircle size={16} />
            Message us on WhatsApp
          </a>

          <Link
            href="/collections/new-arrivals"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 52,
              background: "var(--color-navy)",
              color: "var(--color-cream)",
              textDecoration: "none",
              fontFamily: "var(--font-montserrat)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              color: "var(--text-tertiary)",
              textDecoration: "none",
              fontFamily: "var(--font-montserrat)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "var(--bg-page)",
          }}
        />
      }
    >
      <OrderSuccessInner />
    </Suspense>
  );
}
