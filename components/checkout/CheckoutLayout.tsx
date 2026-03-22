import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "Shipping" },
  { n: 2, label: "Payment" },
  { n: 3, label: "Review" },
];

export default function CheckoutLayout({
  children,
  currentStep,
}: CheckoutLayoutProps) {
  return (
    <div className="checkout-shell">
      <header className="checkout-header">
        <div className="checkout-header__inner">
          <Link href="/" aria-label="Return to Extreme Dept Kidz">
            <Image
              src="/IMG_8640.PNG"
              alt="Extreme Dept Kidz"
              width={100}
              height={30}
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </Link>

          <nav
            className="checkout-steps hidden md:flex"
            aria-label="Checkout steps"
          >
            {STEPS.map((step, i) => {
              const done = currentStep > step.n;
              const current = currentStep === step.n;
              return (
                <div key={step.n} className="flex items-center">
                  <div
                    className={[
                      "checkout-step",
                      current ? "checkout-step--current" : "",
                      done ? "checkout-step--done" : "",
                    ].join(" ")}
                  >
                    <span className="checkout-step__num">
                      {done ? (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        step.n
                      )}
                    </span>
                    <span className="checkout-step__label">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={[
                        "checkout-step__connector",
                        done ? "checkout-step__connector--done" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="checkout-secure">
            <ShieldCheck size={13} strokeWidth={1.5} />
            <span>Secure checkout</span>
          </div>
        </div>

        <div className="checkout-mobile-steps md:hidden">
          <div className="checkout-mobile-steps__bar">
            <div
              className="checkout-mobile-steps__fill"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>
          <p className="checkout-mobile-steps__label">
            Step {currentStep} of {STEPS.length} —{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {STEPS[currentStep - 1].label}
            </span>
          </p>
        </div>
      </header>

      <main className="checkout-main">{children}</main>

      <footer className="checkout-footer">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {[
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Terms", href: "/terms-of-service" },
            { label: "Returns", href: "/returns-exchange" },
            { label: "Contact", href: "/contact" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="checkout-footer__link">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="checkout-footer__copy">
          © {new Date().getFullYear()} Extreme Dept Kidz
        </p>
      </footer>
    </div>
  );
}
