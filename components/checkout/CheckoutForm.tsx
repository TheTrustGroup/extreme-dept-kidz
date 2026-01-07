"use client";

import * as React from "react";
import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Shield } from "lucide-react";
import {
  shippingAddressSchema,
  type ShippingAddress,
  type ShippingMethod,
  type PaymentMethod,
  type CheckoutFormData,
} from "@/types/checkout";
import { Button } from "@/components/ui/button";
import { H2, Body } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  onShippingMethodChange?: (method: ShippingMethod) => void;
}

type CheckoutStep = "shipping" | "shipping-method" | "payment";

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
    price: 800, // $8.00
    estimatedDays: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 1500, // $15.00
    estimatedDays: "2-3 business days",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 2500, // $25.00
    estimatedDays: "Next business day",
  },
];

/**
 * CheckoutForm Component
 * 
 * Multi-step checkout form with validation.
 */
export function CheckoutForm({
  onSubmit,
  onShippingMethodChange,
}: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = React.useState<CheckoutStep>("shipping");
  const [selectedShippingMethod, setSelectedShippingMethod] =
    React.useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("card");
  const [billingSameAsShipping, setBillingSameAsShipping] =
    React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    mode: "onChange",
  });

  const steps: Array<{ id: CheckoutStep; label: string }> = [
    { id: "shipping", label: "Shipping" },
    { id: "shipping-method", label: "Shipping Method" },
    { id: "payment", label: "Payment" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === "shipping") {
      if (isValid) {
        setCurrentStep("shipping-method");
      }
    } else if (currentStep === "shipping-method") {
      setCurrentStep("payment");
    }
  };

  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("shipping-method");
    } else if (currentStep === "shipping-method") {
      setCurrentStep("shipping");
    }
  };

  const onFormSubmit = (data: ShippingAddress) => {
    onSubmit({
      shippingAddress: data,
      shippingMethod: selectedShippingMethod,
      payment: {
        method: paymentMethod,
        billingAddressSameAsShipping: billingSameAsShipping,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 sm:space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center flex-shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200",
                  index <= currentStepIndex
                    ? "border-navy-900 bg-navy-900 text-cream-50"
                    : "border-cream-300 text-charcoal-400"
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
                ) : (
                  <span className="font-sans text-xs xs:text-sm font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "ml-2 xs:ml-3 font-sans text-xs xs:text-sm font-medium hidden xs:block",
                  index <= currentStepIndex
                    ? "text-charcoal-900"
                    : "text-charcoal-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 xs:mx-3 sm:mx-4 transition-colors duration-200 min-w-[20px]",
                  index < currentStepIndex
                    ? "bg-navy-900"
                    : "bg-cream-300"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {currentStep === "shipping" && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ShippingAddressForm register={register} errors={errors} />
          </motion.div>
        )}

        {currentStep === "shipping-method" && (
          <motion.div
            key="shipping-method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ShippingMethodForm
              selected={selectedShippingMethod}
              onSelect={(method) => {
                setSelectedShippingMethod(method);
                onShippingMethodChange?.(method);
              }}
              methods={SHIPPING_METHODS}
            />
          </motion.div>
        )}

        {currentStep === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentForm
              method={paymentMethod}
              onMethodChange={setPaymentMethod}
              billingSameAsShipping={billingSameAsShipping}
              onBillingChange={setBillingSameAsShipping}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-3 xs:gap-4 pt-5 xs:pt-6 border-t border-cream-200">
        {currentStep !== "shipping" && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="text-charcoal-700 w-full xs:w-auto"
          >
            Back
          </Button>
        )}
        <div className="flex-1 hidden xs:block" />
        {currentStep !== "payment" ? (
          <Button type="button" variant="primary" onClick={handleNext} className="w-full xs:w-auto">
            Continue to Next Step
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            loadingText="Processing..."
            className="w-full xs:w-auto"
          >
            Complete Order
          </Button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-col xs:flex-row items-center justify-center gap-4 xs:gap-6 pt-5 xs:pt-6 border-t border-cream-200">
        <div className="flex items-center gap-2 text-charcoal-600">
          <Lock className="w-4 h-4" />
          <Body className="text-xs">Secure Checkout</Body>
        </div>
        <div className="flex items-center gap-2 text-charcoal-600">
          <Shield className="w-4 h-4" />
          <Body className="text-xs">SSL Encrypted</Body>
        </div>
      </div>
    </form>
  );
}

/**
 * Shipping Address Form
 */
interface ShippingAddressFormProps {
  register: UseFormRegister<ShippingAddress>;
  errors: FieldErrors<ShippingAddress>;
}

function ShippingAddressForm({ register, errors }: ShippingAddressFormProps) {
  return (
    <div className="space-y-5 xs:space-y-6">
      <H2 className="text-charcoal-900 text-xl xs:text-2xl sm:text-3xl">Shipping Address</H2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5">
        <FormField
          label="First Name"
          error={errors.firstName}
          required
          id="firstName"
        >
          <input
            {...register("firstName")}
            className={getInputClassName(errors.firstName)}
            placeholder="John"
            type="text"
          />
        </FormField>

        <FormField label="Last Name" error={errors.lastName} required id="lastName">
          <input
            {...register("lastName")}
            className={getInputClassName(errors.lastName)}
            placeholder="Doe"
            type="text"
          />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email} required id="email">
        <input
          type="email"
          {...register("email")}
          className={getInputClassName(errors.email)}
          placeholder="john@example.com"
        />
      </FormField>

      <FormField label="Phone" error={errors.phone} required id="phone">
        <input
          type="tel"
          {...register("phone")}
          className={getInputClassName(errors.phone)}
          placeholder="(555) 123-4567"
        />
      </FormField>

      <FormField label="Address" error={errors.address} required id="address">
        <input
          {...register("address")}
          className={getInputClassName(errors.address)}
          placeholder="123 Main Street"
          type="text"
        />
      </FormField>

      <FormField label="Apartment, suite, etc. (optional)" error={errors.apartment} id="apartment">
        <input
          {...register("apartment")}
          className={getInputClassName(errors.apartment)}
          placeholder="Apt 4B"
          type="text"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-5">
        <FormField label="City" error={errors.city} required id="city">
          <input
            {...register("city")}
            className={getInputClassName(errors.city)}
            placeholder="New York"
            type="text"
          />
        </FormField>

        <FormField label="State" error={errors.state} required id="state">
          <input
            {...register("state")}
            className={getInputClassName(errors.state)}
            placeholder="NY"
            type="text"
          />
        </FormField>

        <FormField label="Zip Code" error={errors.zipCode} required id="zipCode">
          <input
            {...register("zipCode")}
            className={getInputClassName(errors.zipCode)}
            placeholder="10001"
            type="text"
          />
        </FormField>
      </div>

      <FormField label="Country" error={errors.country} required id="country">
        <select
          {...register("country")}
          className={getInputClassName(errors.country)}
        >
          <option value="">Select country</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
        </select>
      </FormField>
    </div>
  );
}

/**
 * Shipping Method Form
 */
interface ShippingMethodFormProps {
  selected: ShippingMethod;
  onSelect: (method: ShippingMethod) => void;
  methods: typeof SHIPPING_METHODS;
}

function ShippingMethodForm({
  selected,
  onSelect,
  methods,
}: ShippingMethodFormProps) {
  return (
    <div className="space-y-6">
      <H2 className="text-charcoal-900">Shipping Method</H2>

      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              selected === method.id
                ? "border-navy-900 bg-cream-100"
                : "border-cream-200 hover:border-charcoal-400"
            )}
            aria-pressed={selected === method.id}
            aria-label={`Select ${method.name} shipping - ${method.description} - ${formatPrice(method.price)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-semibold text-charcoal-900">
                  {method.name}
                </Body>
                <Body className="text-sm text-charcoal-600">
                  {method.description}
                </Body>
              </div>
              <Body className="font-semibold text-charcoal-900">
                {formatPrice(method.price)}
              </Body>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Payment Form
 */
interface PaymentFormProps {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  billingSameAsShipping: boolean;
  onBillingChange: (same: boolean) => void;
}

function PaymentForm({
  method,
  onMethodChange,
  billingSameAsShipping,
  onBillingChange,
}: PaymentFormProps) {
  return (
    <div className="space-y-6">
      <H2 className="text-charcoal-900">Payment</H2>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider block">
          Payment Method
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Payment method">
          <button
            type="button"
            onClick={() => onMethodChange("card")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all duration-200 text-left",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              method === "card"
                ? "border-navy-900 bg-cream-100"
                : "border-cream-200 hover:border-charcoal-400"
            )}
            aria-pressed={method === "card"}
            aria-label="Credit Card payment method"
          >
            <Body className="font-semibold text-charcoal-900">Credit Card</Body>
          </button>

          <button
            type="button"
            onClick={() => onMethodChange("paypal")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all duration-200 text-left",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              method === "paypal"
                ? "border-navy-900 bg-cream-100"
                : "border-cream-200 hover:border-charcoal-400"
            )}
            aria-pressed={method === "paypal"}
            aria-label="PayPal payment method"
          >
            <Body className="font-semibold text-charcoal-900">PayPal</Body>
          </button>

          <button
            type="button"
            onClick={() => onMethodChange("apple-pay")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all duration-200 text-left",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              method === "apple-pay"
                ? "border-navy-900 bg-cream-100"
                : "border-cream-200 hover:border-charcoal-400"
            )}
            aria-pressed={method === "apple-pay"}
            aria-label="Apple Pay payment method"
          >
            <Body className="font-semibold text-charcoal-900">Apple Pay</Body>
          </button>
        </div>
      </div>

      {/* Card Details (if card selected) */}
      {method === "card" && (
        <div className="space-y-4 pt-4 border-t border-cream-200" role="group" aria-label="Card payment details">
          <FormField label="Card Number" id="cardNumber" required>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className={getInputClassName()}
              maxLength={19}
              inputMode="numeric"
              pattern="[0-9\s]{13,19}"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expiry Date" id="expiryDate" required>
              <input
                type="text"
                placeholder="MM/YY"
                className={getInputClassName()}
                maxLength={5}
                inputMode="numeric"
                pattern="[0-9]{2}/[0-9]{2}"
              />
            </FormField>

            <FormField label="CVC" id="cvc" required>
              <input
                type="text"
                placeholder="123"
                className={getInputClassName()}
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]{3,4}"
              />
            </FormField>
          </div>

          <FormField label="Cardholder Name" id="cardholderName" required>
            <input
              type="text"
              placeholder="John Doe"
              className={getInputClassName()}
            />
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={billingSameAsShipping}
              onChange={(e) => onBillingChange(e.target.checked)}
              className="w-4 h-4 rounded border-cream-300 text-navy-900 focus:ring-navy-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Billing address same as shipping address"
            />
            <Body className="text-sm text-charcoal-700">
              Billing address same as shipping
            </Body>
          </label>
        </div>
      )}

      {/* Payment Method Info */}
      {method !== "card" && (
        <div className="p-4 bg-cream-100 rounded-lg border border-cream-200">
          <Body className="text-sm text-charcoal-600">
            {method === "paypal" &&
              "You will be redirected to PayPal to complete your payment."}
            {method === "apple-pay" &&
              "You will be redirected to Apple Pay to complete your payment."}
          </Body>
        </div>
      )}
    </div>
  );
}

/**
 * Form Field Component
 */
interface FormFieldProps {
  label: string;
  error?: { message?: string };
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}

function FormField({ label, error, required, children, id }: FormFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${fieldId}-error`;

  // Clone children to add id and aria attributes
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        id: fieldId,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? errorId : undefined,
        "aria-required": required ? "true" : undefined,
      });
    }
    return child;
  });

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider"
      >
        {label}
        {required && (
          <span className="text-navy-900 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      {childrenWithProps}
      {error && (
        <Body
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error.message}
        </Body>
      )}
    </div>
  );
}

/**
 * Get input className with error state
 */
function getInputClassName(error?: { message?: string }) {
  return cn(
    "w-full px-4 py-3 rounded-lg border bg-cream-50",
    "font-sans text-sm text-charcoal-900",
    "placeholder:text-charcoal-400",
    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
    "transition-all duration-200",
    error
      ? "border-red-300 focus:border-red-500"
      : "border-cream-200 focus:border-navy-900"
  );
}

