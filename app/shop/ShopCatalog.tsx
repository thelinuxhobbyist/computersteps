"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import SiteHeader from "../components/SiteHeader";
import ShopBar from "../components/shop/ShopBar";
import FreeDeliveryBar from "../components/shop/FreeDeliveryBar";
import { addToBasket, useBasket } from "./basket-store";
import {
  CATEGORY_FILTERS,
  PHOTO_CREDITS,
  PRODUCTS,
  SORT_OPTIONS,
  filterProducts,
  formatItemCount,
  formatPrice,
  type CategoryFilter,
  type SortOrder,
} from "./shop-data";

export default function ShopCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortOrder>("featured");
  const { lines, totals, itemCount } = useBasket();
  const searchId = useId();
  const sortId = useId();

  const products = filterProducts(PRODUCTS, { query, category, sort });

  return (
    <div className="site">
      <SiteHeader />
      <ShopBar current="shop" />

      <main className="wrap shop-main">
        <section className="shop-intro">
          <h1>Practice Shop</h1>
          <p>
            Find the things you need and press <strong>Add to Basket</strong>. Nothing here costs real money — it is a safe
            place to practise shopping online.
          </p>
        </section>

        <FreeDeliveryBar totals={totals} />

        <section className="shop-controls" aria-label="Search and filter products">
          <div className="shop-search">
            <label htmlFor={searchId}>Search the shop</label>
            <div className="shop-search__field">
              <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                className="shop-input"
                placeholder="For example: tea"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="shop-sort">
            <label htmlFor={sortId}>Sort by</label>
            <select id={sortId} className="shop-input" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="shop-filters" role="group" aria-label="Category">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`shop-filter ${category === filter.id ? "is-active" : ""}`}
                aria-pressed={category === filter.id}
                onClick={() => setCategory(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <p className="shop-results" aria-live="polite">
          Showing {products.length} of {PRODUCTS.length} products
        </p>

        {products.length === 0 ? (
          <div className="shop-empty">
            <p>
              {query.trim() ? (
                <>
                  No products match <strong>&ldquo;{query.trim()}&rdquo;</strong>. Check the spelling, or try a shorter word.
                </>
              ) : (
                "No products found in this category."
              )}
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Show all products
            </button>
          </div>
        ) : (
          <ul className="product-grid">
            {products.map((product) => {
              const inBasket = lines[product.id] ?? 0;
              return (
                <li key={product.id} className="product-card">
                  <div className="product-card__image">
                    <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 420px) 90vw, 260px" />
                  </div>
                  <div className="product-card__body">
                    <h2 className="product-card__name">{product.name}</h2>
                    <p className="product-card__price">{formatPrice(product.pricePence)}</p>
                    <p className="product-card__category">{product.category === "groceries" ? "Groceries" : "Household"}</p>
                  </div>
                  <button
                    type="button"
                    className={`product-card__add ${inBasket > 0 ? "is-added" : ""}`}
                    onClick={() => addToBasket(product.id)}
                    aria-label={`Add ${product.name} to basket`}
                  >
                    <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                    Add to Basket
                  </button>
                  <p className="product-card__in-basket" aria-live="polite">
                    {inBasket > 0 ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> {inBasket} in your basket
                      </>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {itemCount > 0 ? (
          <div className="shop-next">
            <p>
              You have <strong>{formatItemCount(itemCount)}</strong> in your basket.
            </p>
            <Link href="/basket/" className="btn btn-primary">
              Go to Basket <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        <details className="photo-credits">
          <summary>Photo credits</summary>
          <p>Product photos are from Wikimedia Commons and are used under the licences shown.</p>
          <ul>
            {PHOTO_CREDITS.map((credit) => (
              <li key={credit.productId}>
                <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {credit.title}
                </a>{" "}
                by {credit.author},{" "}
                {credit.licenseUrl ? (
                  <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {credit.license}
                  </a>
                ) : (
                  credit.license
                )}
              </li>
            ))}
          </ul>
        </details>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
