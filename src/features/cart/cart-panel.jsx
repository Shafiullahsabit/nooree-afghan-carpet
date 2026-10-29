"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";

export function CartPanel({ locale, dictionary }) {
  const { items, ready, removeItem, setQuantity } = useCart();
  const [validation, setValidation] = useState({
    key: null,
    status: "loading",
    items: [],
    unavailableIds: [],
  });
  const pages = dictionary.pages;
  const requestKey = JSON.stringify([locale, items]);

  useEffect(() => {
    if (!ready) return;
    if (!items.length) return;

    const controller = new AbortController();

    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale, items }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Cart validation unavailable.");
        return response.json();
      })
      .then((result) => {
        setValidation({
          key: requestKey,
          status: "ready",
          items: result.items,
          unavailableIds: result.unavailableIds,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setValidation({ key: requestKey, status: "error", items: [], unavailableIds: [] });
        }
      });

    return () => controller.abort();
  }, [items, locale, ready, requestKey]);

  const validationIsCurrent = validation.key === requestKey;
  const validatedItems = validationIsCurrent ? validation.items : [];
  const unavailableIds = validationIsCurrent ? validation.unavailableIds : [];
  const status = validationIsCurrent ? validation.status : "loading";

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AFN",
    maximumFractionDigits: 0,
  });
  const subtotal = validatedItems.reduce(
    (total, item) => total + item.price_afn * item.quantity,
    0,
  );

  if (!ready) {
    return <p className="notice">{dictionary.catalog.unavailable}</p>;
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <p>{pages.cartEmpty}</p>
        <Link className="button button-dark" href={`/${locale}/carpets`}>
          {pages.continueShopping}
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return <p className="notice">{pages.cartChecking}</p>;
  }

  if (status === "error") {
    return (
      <p className="notice notice-error" role="alert">
        {dictionary.catalog.unavailable}
      </p>
    );
  }

  if (!validatedItems.length) {
    return (
      <>
        {unavailableIds.length ? (
          <div className="notice notice-error" role="alert">
            <p>{pages.cartUnavailableItems}</p>
            {unavailableIds.map((id) => (
              <button className="inline-button" key={id} type="button" onClick={() => removeItem(id)}>
                {pages.remove}
              </button>
            ))}
          </div>
        ) : null}
        <div className="empty-state">
          <p>{pages.cartEmpty}</p>
          <Link className="button button-dark" href={`/${locale}/carpets`}>
            {pages.continueShopping}
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="cart-layout">
      {unavailableIds.length ? (
        <div className="notice notice-error" role="alert">
          <p>{pages.cartUnavailableItems}</p>
          {unavailableIds.map((id) => (
            <button className="inline-button" key={id} type="button" onClick={() => removeItem(id)}>
              {pages.remove}
            </button>
          ))}
        </div>
      ) : null}
      <div className="cart-items">
        {validatedItems.map((item) => (
          <article className="cart-row" key={item.id}>
            <div className="cart-row-image" aria-hidden="true">
              {item.image ? (
                <div
                  aria-hidden="true"
                  style={{ backgroundImage: `url('${item.image}')`, backgroundPosition: "center", backgroundSize: "cover", height: "100%" }}
                />
              ) : null}
            </div>
            <div className="cart-row-info">
              <Link href={`/${locale}/products/${item.slug}`}>{item.name}</Link>
              <span>{currency.format(item.price_afn)}</span>
              <label>
                {pages.quantity}
                <input
                  type="number"
                  min="1"
                  max={item.stock_quantity}
                  value={item.quantity}
                  onChange={(event) =>
                    setQuantity(item.id, Math.min(Number(event.target.value), item.stock_quantity))
                  }
                />
              </label>
              <button className="inline-button" type="button" onClick={() => removeItem(item.id)}>
                {pages.remove}
              </button>
            </div>
            <strong>{currency.format(item.price_afn * item.quantity)}</strong>
          </article>
        ))}
      </div>
      <aside className="cart-summary">
        <h2>{pages.subtotal}</h2>
        <p>{currency.format(subtotal)}</p>
        <p className="muted-copy">{pages.checkoutUnavailable}</p>
        <Link className="button button-dark" href={`/${locale}/checkout`}>
          {pages.checkout}
        </Link>
      </aside>
    </div>
  );
}
