"use client";

import * as React from "react";
import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CreditCard, Smartphone, Lock, Shield, Wallet } from "lucide-react";
import {
  shippingAddressSchema,
  type ShippingAddress,
  type ShippingMethod,
  type PaymentMethod,
  type CheckoutFormData,
} from "@/types/checkout";
import { Button } from "@/components/ui/button";
import { H2, H3, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useFormattedPrice } from "@/components/providers/CurrencyProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CheckoutSteps, type CheckoutStep } from "./CheckoutSteps";
import { useCartStore } from "@/lib/stores/cart-store";
import Image from "next/image";
import type { ProductImage } from "@/types";

interface CheckoutFormV2Props {
  onSubmit: (data: CheckoutFormData) => void;
  onShippingMethodChange?: (method: ShippingMethod) => void;
}

const SHIPPING_METHODS: Array<{
  id: ShippingMethod;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}> = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 800,
    estimatedDays: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 1500,
    estimatedDays: "2-3 business days",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 2500,
    estimatedDays: "Next business day",
  },
];

/**
 * CheckoutFormV2 Component
 * 
 * Enhanced 3-step checkout form:
 * Step 1: Shipping Information
 * Step 2: Payment Information
 * Step 3: Order Review
 */
export function CheckoutFormV2({
  onSubmit,
  onShippingMethodChange,
}: CheckoutFormV2Props): JSX.Element {
  const { theme } = useTheme();
  const formatPrice = useFormattedPrice();
  const [currentStep, setCurrentStep] = React.useState<CheckoutStep>("shipping");
  const [selectedShippingMethod, setSelectedShippingMethod] =
    React.useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("card");
  const [cardDetails, setCardDetails] = React.useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [momoPhone, setMomoPhone] = React.useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    mode: "onChange",
  });

  const shippingData = watch();

  const handleNext = (): void => {
    if (currentStep === "shipping") {
      if (isValid) {
        setCurrentStep("payment");
        onShippingMethodChange?.(selectedShippingMethod);
      }
    } else if (currentStep === "payment") {
      // Validate payment method
      if (paymentMethod === "card") {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
          return;
        }
      } else if (paymentMethod === "momo") {
        if (!momoPhone.trim()) {
          return;
        }
      }
      // paystack: no extra fields (email from shipping, redirect to Paystack)
      setCurrentStep("review");
    }
  };

  const handleBack = (): void => {
    if (currentStep === "review") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("shipping");
    }
  };

  const onFormSubmit = (): void => {
    onSubmit({
      shippingAddress: shippingData as ShippingAddress,
      shippingMethod: selectedShippingMethod,
      payment: {
        method: paymentMethod,
        billingAddressSameAsShipping: billingSameAsShipping,
        ...(paymentMethod === "card" ? { cardDetails } : paymentMethod === "momo" ? { momoPhone } : {}),
      },
    });
  };

  return (
    <div className={cn(
      "rounded-xl border p-6 sm:p-8",
      theme === "dark"
        ? "bg-dark-surface border-dark-border-glass"
        : "bg-cream-50 border-cream-200"
    )}>
      {/* Steps Indicator */}
      <CheckoutSteps currentStep={currentStep} />

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Shipping Information */}
          {currentStep === "shipping" && (
            <m.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <H2 className={cn(
                "mb-6 text-2xl",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Shipping Information
              </H2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="First Name" error={errors.firstName} required>
                    <input
                      {...register("firstName")}
                      className={getInputClassName(errors.firstName, theme)}
                      placeholder="John"
                      type="text"
                    />
                  </FormField>

                  <FormField label="Last Name" error={errors.lastName} required>
                    <input
                      {...register("lastName")}
                      className={getInputClassName(errors.lastName, theme)}
                      placeholder="Doe"
                      type="text"
                    />
                  </FormField>
                </div>

                <FormField label="Email" error={errors.email} required>
                  <input
                    type="email"
                    {...register("email")}
                    className={getInputClassName(errors.email, theme)}
                    placeholder="john@example.com"
                  />
                </FormField>

                <FormField label="Phone" error={errors.phone} required>
                  <input
                    type="tel"
                    {...register("phone")}
                    className={getInputClassName(errors.phone, theme)}
                    placeholder="+233 XX XXX XXXX"
                  />
                </FormField>

                <FormField label="Address" error={errors.address} required>
                  <input
                    {...register("address")}
                    className={getInputClassName(errors.address, theme)}
                    placeholder="123 Main Street"
                    type="text"
                  />
                </FormField>

                <FormField label="Apartment, suite, etc. (optional)" error={errors.apartment}>
                  <input
                    {...register("apartment")}
                    className={getInputClassName(errors.apartment, theme)}
                    placeholder="Apt 4B"
                    type="text"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="City" error={errors.city} required>
                    <input
                      {...register("city")}
                      className={getInputClassName(errors.city, theme)}
                      placeholder="Accra"
                      type="text"
                    />
                  </FormField>

                  <FormField label="State/Region" error={errors.state} required>
                    <input
                      {...register("state")}
                      className={getInputClassName(errors.state, theme)}
                      placeholder="Greater Accra"
                      type="text"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Zip Code" error={errors.zipCode} required>
                    <input
                      {...register("zipCode")}
                      className={getInputClassName(errors.zipCode, theme)}
                      placeholder="GA123"
                      type="text"
                    />
                  </FormField>

                  <FormField label="Country" error={errors.country} required>
                    <input
                      {...register("country")}
                      className={getInputClassName(errors.country, theme)}
                      placeholder="Ghana"
                      type="text"
                      defaultValue="Ghana"
                    />
                  </FormField>
                </div>

                {/* Shipping Method Selection */}
                <div className="pt-4 border-t border-cream-200 dark:border-dark-border-glass">
                  <H3 className={cn(
                    "mb-4 text-lg",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Shipping Method
                  </H3>
                  <div className="space-y-3">
                    {SHIPPING_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          selectedShippingMethod === method.id
                            ? theme === "dark"
                              ? "border-accent-primary bg-accent-primary/10"
                              : "border-navy-900 bg-navy-50"
                            : theme === "dark"
                              ? "border-dark-border-glass bg-dark-bg-secondary hover:border-dark-border-glass/80"
                              : "border-cream-200 bg-cream-50 hover:border-cream-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={selectedShippingMethod === method.id}
                          onChange={() => setSelectedShippingMethod(method.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Body className={cn(
                              "font-semibold",
                              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                            )}>
                              {method.name}
                            </Body>
                            <Body className={cn(
                              "font-semibold",
                              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                            )}>
                              {formatPrice(method.price)}
                            </Body>
                          </div>
                          <Body className={cn(
                            "text-sm",
                            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                          )}>
                            {method.description}
                          </Body>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValid}
                  variant="primary"
                  size="lg"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </m.div>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === "payment" && (
            <m.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <H2 className={cn(
                "mb-6 text-2xl",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Payment Information
              </H2>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-6">
                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  paymentMethod === "card"
                    ? theme === "dark"
                      ? "border-accent-primary bg-accent-primary/10"
                      : "border-navy-900 bg-navy-50"
                    : theme === "dark"
                      ? "border-dark-border-glass bg-dark-bg-secondary hover:border-dark-border-glass/80"
                      : "border-cream-200 bg-cream-50 hover:border-cream-300"
                )}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <CreditCard className={cn(
                    "w-5 h-5",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )} />
                  <Body className={cn(
                    "font-semibold flex-1",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Credit/Debit Card
                  </Body>
                </label>

                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  paymentMethod === "momo"
                    ? theme === "dark"
                      ? "border-accent-primary bg-accent-primary/10"
                      : "border-navy-900 bg-navy-50"
                    : theme === "dark"
                      ? "border-dark-border-glass bg-dark-bg-secondary hover:border-dark-border-glass/80"
                      : "border-cream-200 bg-cream-50 hover:border-cream-300"
                )}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={() => setPaymentMethod("momo")}
                  />
                  <Smartphone className={cn(
                    "w-5 h-5",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )} />
                  <Body className={cn(
                    "font-semibold flex-1",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Mobile Money
                  </Body>
                </label>

                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  paymentMethod === "paystack"
                    ? theme === "dark"
                      ? "border-accent-primary bg-accent-primary/10"
                      : "border-navy-900 bg-navy-50"
                    : theme === "dark"
                      ? "border-dark-border-glass bg-dark-bg-secondary hover:border-dark-border-glass/80"
                      : "border-cream-200 bg-cream-50 hover:border-cream-300"
                )}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={paymentMethod === "paystack"}
                    onChange={() => setPaymentMethod("paystack")}
                  />
                  <Wallet className={cn(
                    "w-5 h-5",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )} />
                  <Body className={cn(
                    "font-semibold flex-1",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Paystack (Card & Mobile Money)
                  </Body>
                </label>
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4 p-4 rounded-lg bg-cream-100 dark:bg-dark-bg-secondary">
                  <FormField label="Card Number" required>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, number: e.target.value })
                      }
                      className={getInputClassName(undefined, theme)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </FormField>

                  <FormField label="Cardholder Name" required>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, name: e.target.value })
                      }
                      className={getInputClassName(undefined, theme)}
                      placeholder="John Doe"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Expiry Date" required>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiry: e.target.value })
                        }
                        className={getInputClassName(undefined, theme)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </FormField>

                    <FormField label="CVV" required>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvv: e.target.value })
                        }
                        className={getInputClassName(undefined, theme)}
                        placeholder="123"
                        maxLength={4}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Mobile Money Details */}
              {paymentMethod === "momo" && (
                <div className="space-y-4 p-4 rounded-lg bg-cream-100 dark:bg-dark-bg-secondary">
                  <FormField label="Mobile Money Phone Number" required>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      className={getInputClassName(undefined, theme)}
                      placeholder="+233 XX XXX XXXX"
                    />
                  </FormField>
                  <Body className={cn(
                    "text-xs",
                    theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                  )}>
                    You will receive a payment prompt on your phone after placing the order.
                  </Body>
                </div>
              )}

              {paymentMethod === "paystack" && (
                <div className="space-y-2 p-4 rounded-lg bg-cream-100 dark:bg-dark-bg-secondary">
                  <Body className={cn(
                    "text-sm",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                  )}>
                    You will be redirected to Paystack to pay securely with card or mobile money.
                  </Body>
                </div>
              )}

              {/* Billing Address */}
              <div className="pt-4 border-t border-cream-200 dark:border-dark-border-glass">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Body className={cn(
                    "text-sm",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                  )}>
                    Billing address same as shipping address
                  </Body>
                </label>
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="ghost"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    paymentMethod === "card"
                      ? !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name
                      : paymentMethod === "momo"
                        ? !momoPhone.trim()
                        : false
                  }
                  variant="primary"
                  size="lg"
                >
                  Review Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </m.div>
          )}

          {/* Step 3: Order Review */}
          {currentStep === "review" && (
            <m.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <H2 className={cn(
                "mb-6 text-2xl",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Order Review
              </H2>

              <OrderReview
                shippingData={shippingData as ShippingAddress}
                shippingMethod={selectedShippingMethod}
                paymentMethod={paymentMethod}
                onBack={handleBack}
                onSubmit={handleSubmit(onFormSubmit)}
              />
            </m.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

// Helper Components

interface FormFieldProps {
  label: string;
  error?: FieldErrors[string];
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}

function FormField({ label, error, required, children, id: idProp }: FormFieldProps): JSX.Element {
  const { theme } = useTheme();
  const fieldId = React.useId();
  const errorId = React.useId();
  const id = idProp ?? fieldId;

  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  const labelledChild = React.isValidElement(child)
    ? React.cloneElement(child, {
        id,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? errorId : undefined,
        "aria-required": required ? "true" : undefined,
      } as Record<string, unknown>)
    : children;

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "block text-sm font-semibold mb-2",
          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {labelledChild}
      {error && (
        <Body id={errorId} className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
          {error.message as string}
        </Body>
      )}
    </div>
  );
}

function getInputClassName(
  error: FieldErrors[string] | undefined,
  theme: "light" | "dark"
): string {
  return cn(
    "w-full px-4 py-3 rounded-lg border-2 transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    error
      ? theme === "dark"
        ? "border-red-400 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
        : "border-red-400 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
      : theme === "dark"
        ? "border-dark-border-glass bg-dark-bg-secondary text-dark-text-primary placeholder:text-dark-text-muted focus:border-accent-primary focus:ring-accent-primary/20"
        : "border-cream-300 bg-white text-charcoal-900 placeholder:text-charcoal-400 focus:border-navy-900 focus:ring-navy-500/20",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );
}

interface OrderReviewProps {
  shippingData: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  onBack: () => void;
  onSubmit: () => void;
}

function OrderReview({
  shippingData,
  shippingMethod,
  paymentMethod,
  onBack,
  onSubmit,
}: OrderReviewProps): JSX.Element {
  const { theme } = useTheme();
  const formatPrice = useFormattedPrice();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);

  const subtotal = getTotal();
  const shippingPrice = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price || 0;
  const taxEstimate = Math.round(subtotal * 0.125);
  const total = subtotal + shippingPrice + taxEstimate;

  return (
    <div className="space-y-6">
      {/* Shipping Address Summary */}
      <div className={cn(
        "p-4 rounded-lg border",
        theme === "dark" ? "bg-dark-bg-secondary border-dark-border-glass" : "bg-cream-100 border-cream-200"
      )}>
        <H3 className={cn(
          "mb-3 text-lg font-semibold",
          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
        )}>
          Shipping Address
        </H3>
        <Body className={cn(
          "text-sm whitespace-pre-line",
          theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
        )}>
          {shippingData.firstName} {shippingData.lastName}
          {"\n"}
          {shippingData.address}
          {shippingData.apartment && `\n${shippingData.apartment}`}
          {"\n"}
          {shippingData.city}, {shippingData.state} {shippingData.zipCode}
          {"\n"}
          {shippingData.country}
          {"\n"}
          {shippingData.phone}
          {"\n"}
          {shippingData.email}
        </Body>
      </div>

      {/* Payment Method Summary */}
      <div className={cn(
        "p-4 rounded-lg border",
        theme === "dark" ? "bg-dark-bg-secondary border-dark-border-glass" : "bg-cream-100 border-cream-200"
      )}>
        <H3 className={cn(
          "mb-3 text-lg font-semibold",
          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
        )}>
          Payment Method
        </H3>
        <Body className={cn(
          "text-sm",
          theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
        )}>
          {paymentMethod === "card"
                ? "Credit/Debit Card"
                : paymentMethod === "paystack"
                  ? "Paystack (Card & Mobile Money)"
                  : "Mobile Money"}
        </Body>
      </div>

      {/* Order Items Summary */}
      <div className={cn(
        "p-4 rounded-lg border",
        theme === "dark" ? "bg-dark-bg-secondary border-dark-border-glass" : "bg-cream-100 border-cream-200"
      )}>
        <H3 className={cn(
          "mb-4 text-lg font-semibold",
          theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
        )}>
          Order Items
        </H3>
        <div className="space-y-3">
          {items.map((item) => {
            const primaryImage =
              item.product.images.find((img) => (img as ProductImage).isPrimary) || item.product.images[0];
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0">
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt || item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Body className={cn(
                    "font-semibold text-sm truncate",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    {item.product.name}
                  </Body>
                  <Body className={cn(
                    "text-xs",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                  )}>
                    Size: {item.selectedSize} × {item.quantity}
                  </Body>
                </div>
                <Body className={cn(
                  "font-semibold text-sm",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  {formatPrice(item.product.price * item.quantity)}
                </Body>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Total */}
      <div className={cn(
        "p-4 rounded-lg border",
        theme === "dark" ? "bg-dark-bg-secondary border-dark-border-glass" : "bg-cream-100 border-cream-200"
      )}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Body className={cn(
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
            )}>
              Subtotal
            </Body>
            <Body className={cn(
              "font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(subtotal)}
            </Body>
          </div>
          <div className="flex items-center justify-between">
            <Body className={cn(
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
            )}>
              Shipping
            </Body>
            <Body className={cn(
              "font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(shippingPrice)}
            </Body>
          </div>
          <div className="flex items-center justify-between">
            <Body className={cn(
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
            )}>
              Tax (VAT)
            </Body>
            <Body className={cn(
              "font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(taxEstimate)}
            </Body>
          </div>
          <div className={cn(
            "flex items-center justify-between pt-3 border-t",
            theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
          )}>
            <Body className={cn(
              "font-semibold text-lg",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Total
            </Body>
            <Body className={cn(
              "font-serif text-2xl font-semibold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              {formatPrice(total)}
            </Body>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg",
        theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
      )}>
        <Shield className={cn(
          "w-5 h-5 flex-shrink-0 mt-0.5",
          theme === "dark" ? "text-accent-primary" : "text-forest-600"
        )} />
        <div>
          <Body className={cn(
            "text-sm font-semibold mb-1",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            Secure Checkout
          </Body>
          <Body className={cn(
            "text-xs",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
          )}>
            Your payment information is encrypted and secure. We never store your card details.
          </Body>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" onClick={onBack} variant="ghost" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="button" onClick={onSubmit} variant="primary" size="lg" className="min-w-[200px]">
          <Lock className="w-4 h-4 mr-2" />
          Place Order
        </Button>
      </div>
    </div>
  );
}
