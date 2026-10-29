"use client";

import { useCart } from "@/hooks/use-cart";

export function AddToCartButton({ product, label, unavailableLabel }) {
  const { addItem, items, ready } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const unavailable = product.stock_quantity < 1 || product.price_afn === 0;

  return (
    <button
      className="button button-dark"
      type="button"
      disabled={!ready || unavailable}
      onClick={() => addItem(product)}
    >
      {unavailable ? unavailableLabel : inCart ? label.added : label.add}
    </button>
  );
}
