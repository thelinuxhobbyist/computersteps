import type { OrderTotals } from "../../shop/shop-data";
import { formatPrice } from "../../shop/shop-data";

type FreeDeliveryBarProps = {
  totals: OrderTotals;
  compact?: boolean;
};

export default function FreeDeliveryBar({ totals, compact = false }: FreeDeliveryBarProps) {
  const percent = Math.round(totals.freeDeliveryProgressPercent);

  return (
    <section
      className={`delivery-bar ${compact ? "delivery-bar--compact" : ""} ${totals.qualifiesForFreeDelivery ? "is-free" : ""}`}
      aria-label="Free delivery progress"
    >
      <p className="delivery-bar__message" aria-live="polite">
        {totals.qualifiesForFreeDelivery ? (
          <>🎉 You have qualified for FREE Delivery!</>
        ) : (
          <>
            Add <strong>{formatPrice(totals.remainingForFreeDeliveryPence)}</strong> more to your basket to qualify for FREE
            Delivery!
          </>
        )}
      </p>
      <div
        className="delivery-bar__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}% of the way to free delivery`}
      >
        <div className="delivery-bar__fill" style={{ width: `${totals.freeDeliveryProgressPercent}%` }} />
      </div>
      {compact ? null : (
        <p className="delivery-bar__scale">
          <span>{formatPrice(totals.subtotalPence)} in basket</span>
          <span>Free delivery at £35.00</span>
        </p>
      )}
    </section>
  );
}
