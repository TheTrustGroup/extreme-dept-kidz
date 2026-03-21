"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FloatingInput from "./FloatingInput";

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  note: string;
}

interface ShippingStepProps {
  data: ShippingData;
  onChange: (data: ShippingData) => void;
  onNext: () => void;
}

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Upper East",
  "Upper West",
  "Volta",
  "Brong-Ahafo",
  "Savannah",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "North East",
];

type Errors = Partial<Record<keyof ShippingData, string>>;

function validate(data: ShippingData): Errors {
  const e: Errors = {};
  if (!data.firstName.trim()) e.firstName = "First name is required";
  if (!data.lastName.trim()) e.lastName = "Last name is required";
  if (!data.email.trim() || !data.email.includes("@"))
    e.email = "Valid email is required";
  if (!data.phone.trim()) e.phone = "Phone number is required";
  if (!data.address.trim()) e.address = "Delivery address is required";
  if (!data.city.trim()) e.city = "City is required";
  if (!data.region) e.region = "Region is required";
  return e;
}

export default function ShippingStep({
  data,
  onChange,
  onNext,
}: ShippingStepProps) {
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  const set =
    (field: keyof ShippingData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      onChange({ ...data, [field]: e.target.value });
      if (touched)
        setErrors(validate({ ...data, [field]: e.target.value }));
    };

  const handleNext = () => {
    setTouched(true);
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
    else {
      const first = document.querySelector(
        '[aria-invalid="true"]'
      ) as HTMLElement;
      first?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <section className="checkout-section">
        <h2 className="checkout-section__title">Contact</h2>
        <div className="checkout-field-grid">
          <FloatingInput
            label="First name"
            value={data.firstName}
            onChange={set("firstName")}
            error={errors.firstName}
            autoComplete="given-name"
            required
          />
          <FloatingInput
            label="Last name"
            value={data.lastName}
            onChange={set("lastName")}
            error={errors.lastName}
            autoComplete="family-name"
            required
          />
          <FloatingInput
            label="Email address"
            type="email"
            value={data.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
            required
            className="col-span-full"
          />
          <FloatingInput
            label="Phone number"
            type="tel"
            value={data.phone}
            onChange={set("phone")}
            error={errors.phone}
            autoComplete="tel"
            hint="We'll only use this for delivery updates"
            required
            className="col-span-full"
          />
        </div>
      </section>

      <section className="checkout-section">
        <h2 className="checkout-section__title">Delivery Address</h2>
        <div className="checkout-field-grid">
          <FloatingInput
            label="Street address / area"
            value={data.address}
            onChange={set("address")}
            error={errors.address}
            autoComplete="street-address"
            required
            className="col-span-full"
          />
          <FloatingInput
            label="City / Town"
            value={data.city}
            onChange={set("city")}
            error={errors.city}
            autoComplete="address-level2"
            required
          />

          <div className={["floating-field", errors.region ? "" : ""].join(" ")}>
            <div
              className={[
                "floating-field__wrap",
                errors.region ? "floating-field__wrap--error" : "",
                data.region ? "floating-field__wrap--focused" : "",
              ].join(" ")}
            >
              <select
                value={data.region}
                onChange={set("region")}
                className="floating-field__input floating-field__select"
                aria-label="Region"
                aria-invalid={!!errors.region}
                required
              >
                <option value="" disabled />
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <label
                className={[
                  "floating-field__label",
                  data.region ? "floating-field__label--floated" : "",
                ].join(" ")}
              >
                Region{" "}
                <span className="floating-field__required" aria-hidden="true">
                  *
                </span>
              </label>
            </div>
            {errors.region && (
              <p className="floating-field__error" role="alert">
                {errors.region}
              </p>
            )}
          </div>

          <div className="col-span-full">
            <div
              className="floating-field__wrap"
              style={{ height: "auto" }}
            >
              <textarea
                value={data.note}
                onChange={set("note")}
                className="floating-field__input floating-field__textarea"
                placeholder=" "
                rows={3}
                aria-label="Delivery note (optional)"
              />
              <label
                className={[
                  "floating-field__label",
                  data.note ? "floating-field__label--floated" : "",
                ].join(" ")}
              >
                Delivery note (optional)
              </label>
            </div>
          </div>
        </div>
      </section>

      <button
        className="checkout-next-btn"
        onClick={handleNext}
        aria-label="Continue to payment"
      >
        Continue to Payment
        <ArrowRight size={15} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}
