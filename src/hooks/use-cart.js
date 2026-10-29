"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nooree-cart-v1";
const EMPTY_ITEMS = [];
let clientItems = EMPTY_ITEMS;
let initialized = false;
const listeners = new Set();

function readItems() {
  if (typeof window === "undefined") return EMPTY_ITEMS;
  if (initialized) return clientItems;

  initialized = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    clientItems = Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            typeof item?.id === "string" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        )
      : EMPTY_ITEMS;
  } catch {
    clientItems = EMPTY_ITEMS;
  }

  return clientItems;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event) {
  if (event.key !== STORAGE_KEY) return;
  initialized = false;
  readItems();
  notify();
}

function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function saveItems(nextItems) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  clientItems = nextItems;
  initialized = true;
  notify();
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, readItems, () => EMPTY_ITEMS);

  function addItem(product, quantity = 1) {
    const existing = items.find((item) => item.id === product.id);
    const nextItems = existing
      ? items.map((item) =>
          item.id === product.id
            ? { id: item.id, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item,
        )
      : [...items, { id: product.id, quantity: Math.min(quantity, product.stock_quantity) }];

    saveItems(nextItems.filter((item) => item.quantity > 0));
  }

  function setQuantity(id, quantity) {
    const nextItems = items
      .map((item) => (item.id === id ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    saveItems(nextItems);
  }

  function removeItem(id) {
    saveItems(items.filter((item) => item.id !== id));
  }

  return { items, ready: true, addItem, removeItem, setQuantity };
}
