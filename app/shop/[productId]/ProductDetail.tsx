"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import SiteHeader from "../../components/SiteHeader";
import ShopBar from "../../components/shop/ShopBar";
import StarRating from "../../components/shop/StarRating";
import { setQuantity, useBasket } from "../basket-store";
import { MAX_QUANTITY_PER_ITEM, formatItemCount, formatPrice, getProduct } from "../shop-data";
import { getAverageRating, getProductDetails, type Nutrition } from "../product-details";

const NUTRITION_ROWS: { key: keyof Omit<Nutrition, "per" | "serving">; label: string; indent?: boolean }[] = [
  { key: "energy", label: "Energy" },
  { key: "fat", label: "Fat" },
  { key: "saturates", label: "of which saturates", indent: true },
  { key: "carbohydrate", label: "Carbohydrate" },
  { key: "sugars", label: "of which sugars", indent: true },
  { key: "fibre", label: "Fibre" },
  { key: "protein", label: "Protein" },
  { key: "salt", label: "Salt" },
];

export default function ProductDetail({ productId }: { productId: string }) {
  const product = getProduct(productId)!;
  const details = getProductDetails(productId)!;
  const { lines } = useBasket();
  const [quantity, setLocalQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const quantityId = useId();

  const inBasket = lines[product.id] ?? 0;
  const maxAddable = Math.max(0, MAX_QUANTITY_PER_ITEM - inBasket);
  const averageRating = getAverageRating(details.reviews);
  const categoryLabel = product.category === "groceries" ? "Groceries" : "Household";

  const addToBasket = () => {
    const amount = Math.min(quantity, maxAddable);
    if (amount <= 0) return;
    setQuantity(product.id, inBasket + amount);
    setJustAdded(amount);
    setLocalQuantity(1);
  };

  return (
    <div className="site">
      <SiteHeader />
      <ShopBar current="shop" />

      <main className="wrap shop-main">
        <nav className="breadcrumb product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/shop/">Practice Shop</Link>
          <span aria-hidden="true">›</span>
          <span>{categoryLabel}</span>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="product-page">
          <div className="product-page__image">
            <Image src={product.image} alt={product.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 520px" />
          </div>

          <div className="product-page__buy">
            <h1>{product.name}</h1>
            <a href="#reviews" className="product-page__rating">
              <StarRating rating={averageRating} />
              <span>
                {averageRating} ({details.reviews.length} reviews)
              </span>
            </a>

            <p className="product-page__price">{formatPrice(product.pricePence)}</p>
            <p className="product-page__unit">{details.unitPrice}</p>

            <ul className="product-page__highlights">
              {details.highlights.map((highlight) => (
                <li key={highlight}>
                  <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> {highlight}
                </li>
              ))}
            </ul>

            <div className="product-page__actions">
              <div className="product-page__qty">
                <label htmlFor={quantityId}>Quantity</label>
                <div className="basket-item__qty">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setLocalQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="One less"
                  >
                    <FontAwesomeIcon icon={faMinus} aria-hidden="true" />
                  </button>
                  <output id={quantityId} className="qty-value" aria-live="polite">
                    {quantity}
                  </output>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setLocalQuantity((value) => Math.min(Math.max(1, maxAddable), value + 1))}
                    disabled={quantity >= maxAddable}
                    aria-label="One more"
                  >
                    <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button type="button" className="product-card__add product-page__add" onClick={addToBasket} disabled={maxAddable === 0}>
                <FontAwesomeIcon icon={faPlus} aria-hidden="true" /> Add to Basket
              </button>
            </div>

            <div className="product-page__status" aria-live="polite">
              {justAdded ? (
                <div className="product-page__added">
                  <p>
                    <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> Added {formatItemCount(justAdded)} to your basket.
                  </p>
                  <div className="product-page__added-links">
                    <Link href="/basket/" className="btn btn-primary btn-sm">
                      Go to Basket <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                    </Link>
                    <Link href="/shop/" className="btn btn-outline btn-sm">
                      Keep shopping
                    </Link>
                  </div>
                </div>
              ) : inBasket > 0 ? (
                <p className="product-page__in-basket">You have {inBasket} of these in your basket.</p>
              ) : null}
              {maxAddable === 0 ? <p className="product-page__in-basket">You have the most you can buy of this item.</p> : null}
            </div>
          </div>
        </div>

        <section className="product-info" aria-label="Product information">
          <h2>Product description</h2>
          <p>{details.description}</p>
          {details.origin ? <p className="product-info__origin">{details.origin}</p> : null}

          <div className="product-info__panels">
            {details.ingredients || details.allergens ? (
              <details className="product-panel">
                <summary>Ingredients and allergy advice</summary>
                {details.ingredients ? (
                  <>
                    <h3>Ingredients</h3>
                    <p>{details.ingredients}</p>
                  </>
                ) : null}
                {details.allergens ? (
                  <>
                    <h3>Allergy advice</h3>
                    <p>
                      <strong>{details.allergens}</strong>
                    </p>
                  </>
                ) : null}
              </details>
            ) : null}

            {details.nutrition ? (
              <details className="product-panel">
                <summary>Nutrition</summary>
                <table className="nutrition-table">
                  <caption>Typical values</caption>
                  <thead>
                    <tr>
                      <th scope="col">Nutrient</th>
                      <th scope="col">Per {details.nutrition.per}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NUTRITION_ROWS.map((row) => (
                      <tr key={row.key} className={row.indent ? "is-indent" : undefined}>
                        <th scope="row">{row.label}</th>
                        <td>{details.nutrition![row.key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {details.nutrition.serving ? <p className="nutrition-table__note">A typical serving is {details.nutrition.serving}.</p> : null}
              </details>
            ) : null}

            {details.usage ? (
              <details className="product-panel">
                <summary>How to use</summary>
                <p>{details.usage}</p>
              </details>
            ) : null}

            {details.storage ? (
              <details className="product-panel">
                <summary>Storage</summary>
                <p>{details.storage}</p>
              </details>
            ) : null}

            {details.safety ? (
              <details className="product-panel">
                <summary>Safety information</summary>
                <p>{details.safety}</p>
              </details>
            ) : null}
          </div>
        </section>

        <section className="product-reviews" id="reviews" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading">Customer reviews</h2>
          <div className="product-reviews__summary">
            <span className="product-reviews__score">{averageRating}</span>
            <div>
              <StarRating rating={averageRating} />
              <p>Based on {details.reviews.length} reviews</p>
            </div>
          </div>
          <ul className="product-reviews__list">
            {details.reviews.map((review) => (
              <li key={review.author} className="review">
                <div className="review__head">
                  <StarRating rating={review.rating} size="sm" />
                  <h3>{review.title}</h3>
                </div>
                <p className="review__meta">
                  {review.author} · {review.date}
                </p>
                <p>{review.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <Link href="/shop/" className="btn btn-outline">
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back to the shop
        </Link>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
