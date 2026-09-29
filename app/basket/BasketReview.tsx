"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faMinus, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import SiteHeader from "../components/SiteHeader";
import ShopBar from "../components/shop/ShopBar";
import FreeDeliveryBar from "../components/shop/FreeDeliveryBar";
import OrderSummary from "../components/shop/OrderSummary";
import { removeFromBasket, setQuantity, useBasket, useHasMounted } from "../shop/basket-store";
import { MAX_QUANTITY_PER_ITEM, formatPrice } from "../shop/shop-data";

export default function BasketReview() {
  const { items, totals, itemCount } = useBasket();
  const hasMounted = useHasMounted();

  return (
    <div className="site">
      <SiteHeader />
      <ShopBar current="basket" />

      <main className="wrap shop-main">
        <section className="shop-intro">
          <h1>Your Basket</h1>
          <p>
            Check your items. Use <strong>+</strong> and <strong>−</strong> to change how many you want, or{" "}
            <strong>Remove</strong> to take something out.
          </p>
        </section>

        {!hasMounted ? (
          <p className="shop-loading">Loading your basket…</p>
        ) : items.length === 0 ? (
          <div className="shop-empty">
            <p className="shop-empty__icon" aria-hidden="true">🧺</p>
            <h2>Your basket is empty</h2>
            <p>Go back to the shop and press &ldquo;Add to Basket&rdquo; on something you would like.</p>
            <Link href="/shop/" className="btn btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back to the shop
            </Link>
          </div>
        ) : (
          <>
            <FreeDeliveryBar totals={totals} />

            <div className="basket-layout">
              <section aria-label="Items in your basket">
                <ul className="basket-list">
                  {items.map(({ product, quantity, lineTotalPence }) => (
                    <li key={product.id} className="basket-item">
                      <div className="basket-item__image">
                        <Image src={product.image} alt="" fill sizes="72px" />
                      </div>
                      <div className="basket-item__info">
                        <h2 className="basket-item__name">{product.name}</h2>
                        <p className="basket-item__each">{formatPrice(product.pricePence)} each</p>
                      </div>
                      <div className="basket-item__qty" role="group" aria-label={`Quantity of ${product.name}`}>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label={quantity === 1 ? `Remove ${product.name}` : `One less ${product.name}`}
                        >
                          <FontAwesomeIcon icon={faMinus} aria-hidden="true" />
                        </button>
                        <span className="qty-value" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          disabled={quantity >= MAX_QUANTITY_PER_ITEM}
                          aria-label={`One more ${product.name}`}
                        >
                          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                        </button>
                      </div>
                      <p className="basket-item__total">{formatPrice(lineTotalPence)}</p>
                      <button type="button" className="basket-item__remove" onClick={() => removeFromBasket(product.id)}>
                        <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" /> Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <Link href="/shop/" className="btn btn-outline basket-continue">
                  <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Keep shopping
                </Link>
              </section>

              <OrderSummary totals={totals} itemCount={itemCount}>
                <Link href="/checkout/" className="btn btn-primary order-summary__cta">
                  Proceed to Checkout <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </Link>
              </OrderSummary>
            </div>
          </>
        )}
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
