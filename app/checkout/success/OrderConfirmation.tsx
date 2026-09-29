"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faRotateLeft, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import SiteHeader from "../../components/SiteHeader";
import ShopBar from "../../components/shop/ShopBar";
import OrderSummary from "../../components/shop/OrderSummary";
import {
  clearBasket,
  clearPracticeOrder,
  useHasMounted,
  usePracticeOrder,
  type PracticeOrder,
} from "../../shop/basket-store";
import { calculateTotals, countBasketItems, formatPrice, getBasketItems } from "../../shop/shop-data";

export default function OrderConfirmation() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const order = usePracticeOrder();

  const startNewOrder = () => {
    router.push("/shop/");
    clearBasket();
    clearPracticeOrder();
  };

  return (
    <div className="site">
      <SiteHeader />
      <ShopBar current="done" />

      <main className="wrap shop-main">
        {!hasMounted ? (
          <p className="shop-loading">Loading…</p>
        ) : order ? (
          <section className="success-hero" aria-labelledby="success-heading">
            <h1 id="success-heading">🎉 Order Complete! Your practice order is on its way.</h1>
            <p>
              Thank you for your order. Your order number is <strong>{order.orderNumber}</strong>. We&rsquo;ll email you when
              it has been dispatched.
            </p>
          </section>
        ) : (
          <section className="success-hero success-hero--none">
            <h1>No practice order yet</h1>
            <p>Visit the Practice Shop, add some items to your basket and check out to see your order here.</p>
          </section>
        )}

        {hasMounted && order ? (
          <OrderDetails order={order} />
        ) : (
          <SafetyBanners />
        )}

        <div className="success-actions">
          <button type="button" className="btn btn-primary" onClick={startNewOrder}>
            <FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" /> Try Again / Start New Order
          </button>
          <Link href="/courses/" className="btn btn-outline">
            Back to courses
          </Link>
        </div>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}

function OrderDetails({ order }: { order: PracticeOrder }) {
  const items = getBasketItems(order.lines);
  const { delivery } = order;

  return (
    <div className="basket-layout success-details">
      <section className="success-card" aria-labelledby="success-items-heading">
        <h2 id="success-items-heading">What you ordered</h2>
        <ul className="success-items">
          {items.map(({ product, quantity, lineTotalPence }) => (
            <li key={product.id}>
              <span className="success-items__image">
                <Image src={product.image} alt="" fill sizes="40px" />
              </span>
              <span className="success-items__name">
                {quantity} × {product.name}
              </span>
              <span>{formatPrice(lineTotalPence)}</span>
            </li>
          ))}
        </ul>

        <h2>Delivering to</h2>
        <address className="success-address">
          {delivery.fullName}
          <br />
          {delivery.addressLine1}
          {delivery.addressLine2 ? (
            <>
              <br />
              {delivery.addressLine2}
            </>
          ) : null}
          <br />
          {delivery.townOrCity}
          <br />
          {delivery.postcode}
        </address>
      </section>

      <div className="success-side">
        <OrderSummary totals={calculateTotals(order.lines)} itemCount={countBasketItems(order.lines)} />
        <SafetyBanners />
      </div>
    </div>
  );
}

function SafetyBanners() {
  return (
    <div className="safety-banners">
      <div className="safety-banner safety-banner--simulation" role="note">
        <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" className="safety-banner__icon" />
        <p>
          <strong>THIS IS A SIMULATION.</strong> No real money was charged, and no real products will be shipped.
        </p>
      </div>

      <div className="safety-banner safety-banner--tip" role="note">
        <FontAwesomeIcon icon={faLock} aria-hidden="true" className="safety-banner__icon" />
        <p>
          <strong>Security Tip:</strong> Real online stores will always show a padlock icon in the browser address bar when
          paying safely. Never enter your 4-digit cash machine PIN on any website.
        </p>
      </div>
    </div>
  );
}
