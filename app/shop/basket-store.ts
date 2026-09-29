"use client";

import { useSyncExternalStore } from "react";
import {
  MAX_QUANTITY_PER_ITEM,
  getBasketItems,
  getProduct,
  type BasketItem,
  type BasketLines,
  type DeliveryDetails,
  type OrderTotals,
  calculateTotals,
} from "./shop-data";

const BASKET_KEY = "computer-steps:practice-basket";
const ORDER_KEY = "computer-steps:practice-order";
const EMPTY_BASKET: BasketLines = {};

let cachedBasket: BasketLines | null = null;
const listeners = new Set<() => void>();

function readBasket(): BasketLines {
  if (cachedBasket) return cachedBasket;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(BASKET_KEY) ?? "{}");
    const lines: BasketLines = {};
    if (parsed && typeof parsed === "object") {
      for (const [id, quantity] of Object.entries(parsed)) {
        if (getProduct(id) && typeof quantity === "number" && quantity > 0) {
          lines[id] = Math.min(Math.floor(quantity), MAX_QUANTITY_PER_ITEM);
        }
      }
    }
    cachedBasket = lines;
  } catch {
    cachedBasket = {};
  }
  return cachedBasket;
}

function writeBasket(lines: BasketLines) {
  cachedBasket = lines;
  try {
    window.localStorage.setItem(BASKET_KEY, JSON.stringify(lines));
  } catch {
    // Storage can be unavailable (private browsing); the basket still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === BASKET_KEY) {
      cachedBasket = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setQuantity(productId: string, quantity: number) {
  const next = { ...readBasket() };
  const clamped = Math.max(0, Math.min(Math.floor(quantity), MAX_QUANTITY_PER_ITEM));
  if (clamped === 0) {
    delete next[productId];
  } else {
    next[productId] = clamped;
  }
  writeBasket(next);
}

export function removeFromBasket(productId: string) {
  setQuantity(productId, 0);
}

export function clearBasket() {
  writeBasket({});
}

export function useBasket(): { lines: BasketLines; items: BasketItem[]; totals: OrderTotals; itemCount: number } {
  const lines = useSyncExternalStore(subscribe, readBasket, () => EMPTY_BASKET);
  const items = getBasketItems(lines);
  return {
    lines,
    items,
    totals: calculateTotals(lines),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
  };
}

const noopSubscribe = () => () => {};

export function useHasMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export type PracticeOrder = {
  orderNumber: string;
  placedAt: string;
  lines: BasketLines;
  delivery: DeliveryDetails;
};

let cachedOrder: PracticeOrder | null | undefined;

export function savePracticeOrder(order: PracticeOrder) {
  cachedOrder = order;
  try {
    window.sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // Storage can be unavailable; the in-memory copy still covers this visit.
  }
}

function readPracticeOrder(): PracticeOrder | null {
  if (cachedOrder !== undefined) return cachedOrder;
  try {
    const raw = window.sessionStorage.getItem(ORDER_KEY);
    cachedOrder = raw ? (JSON.parse(raw) as PracticeOrder) : null;
  } catch {
    cachedOrder = null;
  }
  return cachedOrder;
}

export function clearPracticeOrder() {
  cachedOrder = null;
  try {
    window.sessionStorage.removeItem(ORDER_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function usePracticeOrder(): PracticeOrder | null {
  return useSyncExternalStore(noopSubscribe, readPracticeOrder, () => null);
}
