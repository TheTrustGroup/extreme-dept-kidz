"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";

export default function AdminLoginPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await login(email, password);
      if (ok) {
        router.replace("/admin");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh",
      display: "flex",
      background: "var(--adm-bg)",
      fontFamily: "var(--font-inter, system-ui, sans-serif)",
    } as React.CSSProperties,

    left: {
      width: 360,
      flexShrink: 0,
      background: "var(--adm-s1)",
      borderRight: "1px solid var(--adm-b1)",
      display: "flex",
      flexDirection: "column" as const,
      padding: "40px 36px",
      minHeight: "100vh",
    } as React.CSSProperties,

    right: {
      flex: 1,
      background: "var(--adm-bg)",
      display: "flex",
      flexDirection: "column" as const,
      padding: "40px 40px",
    } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      {/* ── Left: form ── */}
      <div className="adm-login-left" style={s.left}>
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 52,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: "var(--adm-gold)",
              borderRadius: "var(--adm-radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#0a0a0f",
              flexShrink: 0,
            }}
          >
            E3
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--adm-t1)",
            }}
          >
            EDK Admin
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--adm-t1)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--adm-t3)",
            marginBottom: 36,
            lineHeight: 1.5,
          }}
        >
          Sign in to manage your store.
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "var(--adm-ro2)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "var(--adm-radius)",
              padding: "10px 12px",
              fontSize: 12,
              color: "var(--adm-rose)",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--adm-t3)",
                marginBottom: 6,
              }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@extremedeptkidz.com"
              autoComplete="email"
              required
              style={{
                width: "100%",
                height: 42,
                background: "var(--adm-s2)",
                border: "1px solid var(--adm-b2)",
                borderRadius: "var(--adm-radius)",
                padding: "0 12px",
                color: "var(--adm-t1)",
                fontSize: 13,
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--adm-gold)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--adm-b2)";
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--adm-t3)",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  height: 42,
                  background: "var(--adm-s2)",
                  border: "1px solid var(--adm-b2)",
                  borderRadius: "var(--adm-radius)",
                  padding: "0 40px 0 12px",
                  color: "var(--adm-t1)",
                  fontSize: 13,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--adm-gold)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--adm-b2)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "var(--adm-t3)",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember + forgot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <div
                className="adm-login-remember"
                onClick={() => setRemember((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setRemember((v) => !v);
                  }
                }}
                role="checkbox"
                aria-checked={remember}
                tabIndex={0}
                style={{
                  width: 14,
                  height: 14,
                  border: "1px solid var(--adm-b2)",
                  borderRadius: 3,
                  background: remember ? "var(--adm-gold)" : "var(--adm-s2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 150ms ease",
                }}
              >
                {remember && (
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 12, color: "var(--adm-t2)" }}>Remember me</span>
            </label>
            <Link
              href="/admin/forgot-password"
              style={{
                fontSize: 12,
                color: "var(--adm-t3)",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 42,
              background: loading ? "rgba(201,162,39,0.5)" : "var(--adm-gold)",
              border: "none",
              borderRadius: "var(--adm-radius)",
              color: "#0a0a0f",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 150ms ease",
              marginBottom: 0,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(10,10,15,0.3)",
                    borderTopColor: "#0a0a0f",
                    borderRadius: "50%",
                    animation: "edk-spin 0.7s linear infinite",
                    flexShrink: 0,
                  }}
                />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 32,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ShieldCheck size={13} style={{ color: "var(--adm-t3)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--adm-t3)" }}>
            Secured · Extreme Dept Kidz © {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ── Right: store preview ── */}
      <div className="adm-login-right" style={s.right}>
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--adm-t3)",
            marginBottom: 20,
          }}
        >
          Store overview
        </p>

        {/* Stat grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {(
            [
              { label: "Revenue", value: "₵0", gold: true },
              { label: "Orders", value: "0" },
              { label: "Products", value: "1" },
              { label: "Low Stock", value: "6", red: true },
            ] satisfies ReadonlyArray<{
              label: string;
              value: string;
              gold?: boolean;
              red?: boolean;
            }>
          ).map(({ label, value, gold, red }) => (
            <div
              key={label}
              style={{
                background: "var(--adm-s1)",
                border: "1px solid var(--adm-b1)",
                borderRadius: "var(--adm-radius)",
                padding: "14px 16px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: gold ? "var(--adm-gold)" : red ? "var(--adm-rose)" : "var(--adm-t1)",
                  lineHeight: 1,
                  marginBottom: 5,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--adm-t3)",
                }}
              >
                {label}
              </div>
              {red && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--adm-rose)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div
          style={{
            background: "var(--adm-s1)",
            border: "1px solid var(--adm-b1)",
            borderRadius: "var(--adm-radius)",
            padding: "16px",
            flex: 1,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--adm-t3)",
              marginBottom: 14,
            }}
          >
            Recent activity
          </p>
          {[
            { dot: "var(--adm-gold)", text: "New product added — Jordan Legacy T-Shirt", time: "2h ago" },
            { dot: "var(--adm-emerald)", text: "Store published · extremedeptkidz.com", time: "1d ago" },
            { dot: "var(--adm-sky)", text: "Admin account created", time: "2d ago" },
            { dot: "var(--adm-t3)", text: "6 inventory items below threshold", time: "now" },
          ].map(({ dot, text, time }) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 11,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: dot,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "var(--adm-t2)", flex: 1 }}>{text}</span>
              <span style={{ fontSize: 11, color: "var(--adm-t3)", flexShrink: 0 }}>{time}</span>
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: "auto",
            paddingTop: 20,
            fontSize: 10,
            color: "var(--adm-t3)",
            letterSpacing: "0.04em",
          }}
        >
          Extreme Dept Kidz · Admin Portal · Accra, Ghana
        </p>
      </div>

      <style>{`
        @keyframes edk-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .adm-login-right { display: none !important; }
          .adm-login-left {
            width: 100% !important;
            min-width: 0 !important;
            border-right: none !important;
          }
        }
      `}</style>
    </div>
  );
}
