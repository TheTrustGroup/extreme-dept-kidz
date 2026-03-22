/**
 * Order Service
 * Mission-critical: create orders and confirm payment (idempotent) with inventory deduction.
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";

export interface CreateOrderItem {
  productId: string;
  size: string;
  quantity: number;
}

export interface ShippingAddressForOrder {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderInput {
  items: CreateOrderItem[];
  shippingAddress: ShippingAddressForOrder;
  billingAddress?: ShippingAddressForOrder | null;
  paymentMethod: string;
  shippingAmount: number; // cents
  taxAmount?: number; // cents, default 0
  idempotencyKey?: string | null;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
}

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomBytes(4).toString("hex");
  return `ORD-${datePart}-${randomPart}`;
}

/**
 * Create an order and order items in a single transaction.
 * Validates product/variant existence and stock; does not reserve stock (stock is deducted on payment confirm).
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  if (!prisma) {
    throw new Error("Database not available");
  }

  const { items, shippingAddress, billingAddress, paymentMethod, shippingAmount, taxAmount = 0 } =
    input;
  if (items.length === 0) {
    throw new Error("At least one item is required");
  }

  const orderNumber = generateOrderNumber();

  const result = await prisma.$transaction(async (tx) => {
    const orderItemsWithPrice: { productId: string; variantId: string; quantity: number; price: number }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const variant = await tx.productVariant.findFirst({
        where: {
          productId: item.productId,
          size: item.size,
          isActive: true,
        },
        include: { product: { select: { id: true, price: true, name: true } } },
      });

      if (!variant) {
        throw new Error(`Variant not found for product ${item.productId} size ${item.size}`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${variant.product.name} size ${item.size}. Available: ${variant.stock}, requested: ${item.quantity}`
        );
      }

      const price = variant.price ?? variant.product.price;
      orderItemsWithPrice.push({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        price,
      });
      subtotal += price * item.quantity;
    }

    const total = subtotal + shippingAmount + taxAmount;

    const paymentMethodForDb =
      paymentMethod === "paystack"
        ? "card"
        : paymentMethod === "pay_on_delivery"
          ? "cash_on_delivery"
          : paymentMethod;

    const order = await tx.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        subtotal,
        shipping: shippingAmount,
        tax: taxAmount,
        total,
        shippingAddress: shippingAddress as unknown as object,
        billingAddress: (billingAddress ?? undefined) as object | undefined,
        paymentMethod: paymentMethodForDb,
        paymentStatus: "PENDING",
        items: {
          create: orderItemsWithPrice.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: { items: true },
    });

    return { orderId: order.id, orderNumber: order.orderNumber, total: order.total };
  });

  logger.log("[Order] Created", result.orderNumber, result.orderId);
  return result;
}

/**
 * Confirm payment for an order: set payment status to COMPLETED, deduct inventory, write InventoryLog.
 * Idempotent: if order is already COMPLETED, returns without error.
 */
export async function confirmOrderPayment(orderId: string): Promise<{ alreadyCompleted: boolean }> {
  if (!prisma) {
    throw new Error("Database not available");
  }

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { variant: true, product: true } } },
    });

    if (!order) {
      throw new Error("Order not found");
    }
    if (order.paymentStatus === "COMPLETED") {
      return { alreadyCompleted: true };
    }

    for (const item of order.items) {
      const variant = item.variant;
      if (variant.stock < item.quantity) {
        logger.warn(
          `[Order] Insufficient stock on confirm: order ${orderId} variant ${variant.id} has ${variant.stock}, need ${item.quantity}`
        );
        // Still deduct to match payment; consider refund flow separately
      }
      const newStock = Math.max(0, variant.stock - item.quantity);
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: newStock },
      });
      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          change: -item.quantity,
          reason: "sale",
          orderId: order.id,
          notes: `Order ${order.orderNumber}`,
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        status: "PROCESSING",
      },
    });

    logger.log("[Order] Payment confirmed", order.orderNumber, orderId);
    return { alreadyCompleted: false };
  });

  return result;
}
