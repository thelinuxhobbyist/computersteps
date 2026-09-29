import type { ReactNode } from "react";
import type { OrderTotals } from "../../shop/shop-data";
import { formatPrice } from "../../shop/shop-data";

type OrderSummaryProps = {
  totals: OrderTotals;
  itemCount: number;
  children?: ReactNode;
};

export default function OrderSummary({ totals, itemCount, children }: OrderSummaryProps) {
  return (
    <aside className="order-summary" aria-labelledby="order-summary-heading">
      <h2 id="order-summary-heading">Order Summary</h2>
      <dl className="order-summary__rows">
        <div>
          <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
          <dd>{formatPrice(totals.subtotalPence)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd className={totals.deliveryPence === 0 ? "is-free" : undefined}>
            {totals.deliveryPence === 0 ? "FREE" : formatPrice(totals.deliveryPence)}
          </dd>
        </div>
        <div className="order-summary__total">
          <dt>Total Price</dt>
          <dd>{formatPrice(totals.totalPence)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
