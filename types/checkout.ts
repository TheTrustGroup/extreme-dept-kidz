/**
 * Checkout Type Definitions
 */

import { z } from "zod";

/**
 * Shipping Address Schema
 */
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/**
 * Shipping Method
 */
export type ShippingMethod = "standard" | "express" | "overnight";

export interface ShippingMethodOption {
  id: ShippingMethod;
  name: string;
  description: string;
  price: number; // in cents
  estimatedDays: string;
}

/**
 * Payment Method
 */
export type PaymentMethod = "card" | "paypal" | "apple-pay";

/**
 * Payment Details (Stripe-ready structure)
 */
export interface PaymentDetails {
  method: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardName?: string;
  billingAddressSameAsShipping?: boolean;
  billingAddress?: ShippingAddress;
}

/**
 * Checkout Form Data
 */
export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  payment: PaymentDetails;
}


