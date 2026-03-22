"use client";

import Image from "next/image";

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
}

interface CheckoutOrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency?: string;
}

function fmt(n: number) {
  return `₵${(n / 100).toFixed(2)}`;
}

const PLACEHOLDER = "/boys-hero.jpg";

export default function CheckoutOrderSummary({
  items,
  subtotal,
  shippingCost,
  total,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="checkout-summary">
      <h3 className="checkout-summary__title">Order Summary</h3>

      <div className="checkout-summary__items">
        {items.map((item) => (
          <div key={item.id} className="checkout-summary__item">
            <div className="checkout-summary__img-wrap">
              <Image
                src={item.imageUrl || PLACEHOLDER}
                alt={item.name}
                fill
                className="object-cover"
                sizes="56px"
              />
              <span className="checkout-summary__qty">{item.quantity}</span>
            </div>
            <div className="checkout-summary__item-info">
              <p className="checkout-summary__item-name">{item.name}</p>
              {item.size && (
                <p className="checkout-summary__item-size">Size: {item.size}</p>
              )}
            </div>
            <p className="checkout-summary__item-price">
              {fmt(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="checkout-summary__totals">
        <div className="checkout-summary__row">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="checkout-summary__row">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? "FREE" : fmt(shippingCost)}</span>
        </div>
        <div className="checkout-summary__row checkout-summary__row--total">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
