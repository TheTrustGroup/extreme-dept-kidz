"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useToast } from "@/lib/stores/toast-store";

export default function NewsletterSection() {
  const { success, error } = useToast();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data.error === "string" ? data.error : "Something went wrong. Please try again.";
        setErrorMsg(msg);
        setStatus("error");
        error("Something went wrong", msg);
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }
      setStatus("success");
      setEmail("");
      success("You're subscribed!", "Watch your inbox for the next drop.");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      error("Something went wrong", "Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section
      ref={ref}
      className="newsletter-section"
      aria-labelledby="newsletter-heading"
    >
      <div className="container-luxury">
        <motion.div
          className="newsletter-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="newsletter-copy">
            <p className="newsletter-eyebrow">Stay in the loop</p>
            <h2 id="newsletter-heading" className="newsletter-title">
              Exclusive drops,
              <br />
              <em>before anyone else.</em>
            </h2>
            <p className="newsletter-desc">
              New arrivals, style tips, and early access — straight to your
              inbox.
            </p>
          </div>

          <div className="newsletter-form-wrap">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="newsletter-success"
                >
                  <span className="newsletter-success__icon">
                    <Check size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="newsletter-success__title">You're in.</p>
                    <p className="newsletter-success__desc">
                      Watch your inbox for the next drop.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="newsletter-form"
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="newsletter-input-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="Your email address"
                      className="newsletter-input"
                      aria-label="Email address"
                      autoComplete="email"
                      required
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="newsletter-btn"
                      aria-label="Subscribe to newsletter"
                    >
                      {status === "loading" ? (
                        <span
                          className="pdp-spinner"
                          style={{
                            borderColor: "rgba(15,23,42,0.3)",
                            borderTopColor: "#0f172a",
                          }}
                        />
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </div>

                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="newsletter-error"
                    >
                      {errorMsg}
                    </motion.p>
                  )}

                  <p className="newsletter-privacy">
                    No spam. Unsubscribe anytime.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
