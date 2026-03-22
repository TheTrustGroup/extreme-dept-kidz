"use client";

import type { ChangeEvent } from "react";

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  notes: string;
}

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Northern",
  "Upper East",
  "Upper West",
  "Volta",
  "Brong-Ahafo",
  "Western North",
  "Ahafo",
  "Bono East",
  "Oti",
  "Savannah",
  "North East",
];

interface CustomerFormProps {
  value: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
  errors: Partial<Record<keyof CustomerInfo, string>>;
}

export default function CustomerForm({ value, onChange, errors }: CustomerFormProps) {
  const set =
    (field: keyof CustomerInfo) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      onChange({ ...value, [field]: e.target.value });

  return (
    <div className="checkout-form">
      <h2 className="checkout-form__title">Delivery Information</h2>

      <div className="checkout-form__row">
        <div className="checkout-form__field">
          <label className="checkout-form__label">First Name *</label>
          <input
            className={[
              "checkout-form__input",
              errors.firstName ? "checkout-form__input--error" : "",
            ].join(" ")}
            type="text"
            value={value.firstName}
            onChange={set("firstName")}
            placeholder="Kwame"
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="checkout-form__error">{errors.firstName}</p>
          )}
        </div>
        <div className="checkout-form__field">
          <label className="checkout-form__label">Last Name *</label>
          <input
            className={[
              "checkout-form__input",
              errors.lastName ? "checkout-form__input--error" : "",
            ].join(" ")}
            type="text"
            value={value.lastName}
            onChange={set("lastName")}
            placeholder="Asante"
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="checkout-form__error">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="checkout-form__field">
        <label className="checkout-form__label">Email Address (optional)</label>
        <input
          className={[
            "checkout-form__input",
            errors.email ? "checkout-form__input--error" : "",
          ].join(" ")}
          type="email"
          value={value.email}
          onChange={set("email")}
          placeholder="kwame@email.com"
          autoComplete="email"
        />
        {errors.email && <p className="checkout-form__error">{errors.email}</p>}
      </div>

      <div className="checkout-form__field">
        <label className="checkout-form__label">
          Phone Number * (we&apos;ll call to confirm delivery)
        </label>
        <div className="checkout-form__phone-wrap">
          <span className="checkout-form__phone-prefix">🇬🇭 +233</span>
          <input
            className={[
              "checkout-form__input checkout-form__input--phone",
              errors.phone ? "checkout-form__input--error" : "",
            ].join(" ")}
            type="tel"
            value={value.phone}
            onChange={set("phone")}
            placeholder="024 123 4567"
            autoComplete="tel"
            inputMode="numeric"
          />
        </div>
        {errors.phone && <p className="checkout-form__error">{errors.phone}</p>}
      </div>

      <div className="checkout-form__field">
        <label className="checkout-form__label">Delivery Address (optional)</label>
        <input
          className={[
            "checkout-form__input",
            errors.address ? "checkout-form__input--error" : "",
          ].join(" ")}
          type="text"
          value={value.address}
          onChange={set("address")}
          placeholder="House number, street name, area"
          autoComplete="street-address"
        />
        {errors.address && (
          <p className="checkout-form__error">{errors.address}</p>
        )}
      </div>

      <div className="checkout-form__row">
        <div className="checkout-form__field">
          <label className="checkout-form__label">City (optional)</label>
          <input
            className={[
              "checkout-form__input",
              errors.city ? "checkout-form__input--error" : "",
            ].join(" ")}
            type="text"
            value={value.city}
            onChange={set("city")}
            placeholder="Accra"
            autoComplete="address-level2"
          />
          {errors.city && <p className="checkout-form__error">{errors.city}</p>}
        </div>
        <div className="checkout-form__field">
          <label className="checkout-form__label">Region (optional)</label>
          <select
            className={[
              "checkout-form__input checkout-form__select",
              errors.region ? "checkout-form__input--error" : "",
            ].join(" ")}
            value={value.region}
            onChange={set("region")}
          >
            <option value="">Select region</option>
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="checkout-form__error">{errors.region}</p>
          )}
        </div>
      </div>

      <div className="checkout-form__field">
        <label className="checkout-form__label">Order Notes (optional)</label>
        <textarea
          className="checkout-form__input checkout-form__textarea"
          value={value.notes}
          onChange={set("notes")}
          placeholder="Any special instructions for delivery..."
          rows={3}
        />
      </div>
    </div>
  );
}
