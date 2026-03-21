"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Smartphone,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react";
import FloatingInput from "./FloatingInput";

export interface PaymentData {
  method: "momo" | "card";
  momoNetwork: "mtn" | "vodafone" | "airteltigo" | "";
  momoPhone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
}

interface PaymentStepProps {
  data: PaymentData;
  onChange: (data: PaymentData) => void;
  onNext: () => void;
  onBack: () => void;
  total: number;
  currency: string;
}

const MOMO_NETWORKS = [
  {
    value: "mtn" as const,
    label: "MTN MoMo",
    color: "#FFCC00",
    textColor: "#000",
  },
  {
    value: "vodafone" as const,
    label: "Vodafone Cash",
    color: "#E60000",
    textColor: "#fff",
  },
  {
    value: "airteltigo" as const,
    label: "AirtelTigo",
    color: "#FF6B00",
    textColor: "#fff",
  },
];

function fmt(n: number, cur = "GHS ₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type PaymentErrors = Partial<{
  momoPhone: string;
  momoNetwork: string;
}>;

export default function PaymentStep({
  data,
  onChange,
  onNext,
  onBack,
  total,
  currency,
}: PaymentStepProps) {
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [momoStatus, setMomoStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  const set =
    (field: keyof PaymentData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [field]: e.target.value });

  const handleSendPrompt = async () => {
    if (!data.momoPhone || data.momoPhone.length < 9) {
      setErrors({ momoPhone: "Enter a valid MoMo phone number" });
      return;
    }
    if (!data.momoNetwork) {
      setErrors({ momoNetwork: "Select your network" });
      return;
    }
    setErrors({});
    setMomoStatus("sending");
    // Wire to your MoMo initiate API:
    // await fetch('/api/payments/momo/initiate', {
    //   method: 'POST',
    //   body: JSON.stringify({ phone: data.momoPhone, network: data.momoNetwork, amount: total })
    // })
    await new Promise((r) => setTimeout(r, 1800));
    setMomoStatus("sent");
  };

  const handleNext = () => {
    if (data.method === "momo" && momoStatus !== "sent") {
      setErrors({ momoPhone: "Please approve the MoMo prompt first" });
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <section className="checkout-section">
        <h2 className="checkout-section__title">Payment Method</h2>

        <div className="payment-method-grid">
          <button
            className={[
              "payment-method-btn",
              data.method === "momo" ? "payment-method-btn--active" : "",
            ].join(" ")}
            onClick={() => onChange({ ...data, method: "momo" })}
            aria-pressed={data.method === "momo"}
          >
            <Smartphone size={18} strokeWidth={1.5} />
            <span>Mobile Money</span>
            {data.method === "momo" && (
              <span className="payment-method-btn__check">
                <Check size={11} strokeWidth={2.5} />
              </span>
            )}
          </button>

          <button
            className={[
              "payment-method-btn",
              data.method === "card" ? "payment-method-btn--active" : "",
            ].join(" ")}
            onClick={() => onChange({ ...data, method: "card" })}
            aria-pressed={data.method === "card"}
          >
            <CreditCard size={18} strokeWidth={1.5} />
            <span>Card</span>
            {data.method === "card" && (
              <span className="payment-method-btn__check">
                <Check size={11} strokeWidth={2.5} />
              </span>
            )}
          </button>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {data.method === "momo" && (
          <motion.section
            key="momo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="checkout-section"
          >
            <div className="momo-networks">
              {MOMO_NETWORKS.map((net) => (
                <button
                  key={net.value}
                  className={[
                    "momo-network-btn",
                    data.momoNetwork === net.value
                      ? "momo-network-btn--active"
                      : "",
                  ].join(" ")}
                  style={
                    data.momoNetwork === net.value
                      ? {
                          borderColor: net.color,
                          backgroundColor: `${net.color}18`,
                        }
                      : {}
                  }
                  onClick={() =>
                    onChange({ ...data, momoNetwork: net.value })
                  }
                  aria-pressed={data.momoNetwork === net.value}
                >
                  <span
                    className="momo-network-btn__dot"
                    style={{ backgroundColor: net.color }}
                    aria-hidden="true"
                  />
                  {net.label}
                </button>
              ))}
            </div>
            {errors.momoNetwork && (
              <p className="floating-field__error mt-2">
                {errors.momoNetwork}
              </p>
            )}

            <div className="mt-4">
              <FloatingInput
                label="MoMo phone number"
                type="tel"
                value={data.momoPhone}
                onChange={set("momoPhone")}
                error={errors.momoPhone}
                hint="Enter the number registered with your mobile money"
                autoComplete="tel"
                required
              />
            </div>

            <AnimatePresence mode="wait">
              {momoStatus === "sent" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="momo-prompt-success"
                >
                  <div className="momo-prompt-success__icon">
                    <Check size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="momo-prompt-success__title">
                      Prompt sent to {data.momoPhone}
                    </p>
                    <p className="momo-prompt-success__desc">
                      Approve the payment of{" "}
                      <strong>{fmt(total, currency)}</strong> on your
                      phone, then tap &quot;Place Order&quot; below.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="send"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="momo-send-btn"
                  onClick={handleSendPrompt}
                  disabled={momoStatus === "sending"}
                >
                  {momoStatus === "sending" ? (
                    <>
                      <Loader2
                        size={15}
                        strokeWidth={1.5}
                        className="animate-spin"
                      />
                      Sending prompt…
                    </>
                  ) : (
                    <>
                      <Smartphone size={15} strokeWidth={1.5} />
                      Send {fmt(total, currency)} MoMo Prompt
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {data.method === "card" && (
          <motion.section
            key="card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="checkout-section"
          >
            <div className="checkout-field-grid">
              <FloatingInput
                label="Card number"
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={data.cardNumber}
                onChange={(e) => {
                  const v = e.target.value
                    .replace(/\s/g, "")
                    .replace(/(\d{4})/g, "$1 ")
                    .trim();
                  onChange({ ...data, cardNumber: v });
                }}
                autoComplete="cc-number"
                className="col-span-full"
              />
              <FloatingInput
                label="Name on card"
                value={data.cardName}
                onChange={set("cardName")}
                autoComplete="cc-name"
                className="col-span-full"
              />
              <FloatingInput
                label="Expiry (MM / YY)"
                type="text"
                inputMode="numeric"
                maxLength={7}
                value={data.cardExpiry}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  const formatted =
                    v.length > 2
                      ? `${v.slice(0, 2)} / ${v.slice(2, 4)}`
                      : v;
                  onChange({ ...data, cardExpiry: formatted });
                }}
                autoComplete="cc-exp"
              />
              <FloatingInput
                label="CVV"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={data.cardCvv}
                onChange={set("cardCvv")}
                autoComplete="cc-csc"
                hint="3–4 digits on your card"
              />
            </div>
            <p className="checkout-card-note">
              🔒 Card details are encrypted and never stored on our
              servers.
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="checkout-nav-row">
        <button
          className="checkout-back-btn"
          onClick={onBack}
          aria-label="Back to shipping"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </button>
        <button
          className="checkout-next-btn"
          onClick={handleNext}
          aria-label="Continue to review"
          style={{ flex: 1 }}
        >
          Review Order
          <ArrowRight size={15} strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
}
