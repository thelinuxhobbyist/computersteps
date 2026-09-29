"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";
import { useBasket } from "../../shop/basket-store";
import { formatItemCount, formatPrice } from "../../shop/shop-data";

const STEPS = [
  { id: "shop", label: "Shop", href: "/shop/" },
  { id: "basket", label: "Basket", href: "/basket/" },
  { id: "checkout", label: "Checkout", href: "/checkout/" },
  { id: "done", label: "Done", href: null },
] as const;

type ShopStep = (typeof STEPS)[number]["id"];

export default function ShopBar({ current }: { current: ShopStep }) {
  const { itemCount, totals } = useBasket();
  const basketLabel = itemCount > 0 ? `${formatItemCount(itemCount)} (${formatPrice(totals.subtotalPence)})` : formatItemCount(itemCount);
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <div className="shop-bar">
      <div className="wrap shop-bar__inner">
        <div className="shop-bar__brand">
          <span className="shop-bar__name">Practice Shop</span>
          <span className="shop-bar__tag">Pretend money only</span>
        </div>

        <ol className="shop-steps" aria-label="Shopping steps">
          {STEPS.map((step, index) => {
            const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
            return (
              <li key={step.id} className={`shop-steps__item is-${state}`} aria-current={state === "current" ? "step" : undefined}>
                <span className="shop-steps__num" aria-hidden="true">{index + 1}</span>
                {step.href && state === "done" && current !== "done" ? (
                  <Link href={step.href}>{step.label}</Link>
                ) : (
                  <span>{step.label}</span>
                )}
              </li>
            );
          })}
        </ol>

        <Link href="/basket/" className="shop-basket-link" aria-label={`Basket: ${basketLabel}. Open basket.`}>
          <FontAwesomeIcon icon={faBasketShopping} aria-hidden="true" />
          <span>
            Basket: <strong aria-live="polite">{basketLabel}</strong>
          </span>
        </Link>
      </div>
    </div>
  );
}
