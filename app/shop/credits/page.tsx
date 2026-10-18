import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { PHOTO_CREDITS, SHOP_NAME, getProduct } from "../shop-data";

export const metadata: Metadata = {
  title: `Photo credits | ${SHOP_NAME} | Computer Steps`,
};

export default function PhotoCreditsPage() {
  return (
    <div className="site">
      <SiteHeader />

      <main className="wrap shop-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/scenarios/">Scenarios</Link>
          <span aria-hidden="true">›</span>
          <Link href="/shop/">{SHOP_NAME}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Photo credits</span>
        </nav>

        <section className="shop-intro">
          <h1>Photo credits</h1>
          <p>Product photos come from Wikimedia Commons and are used under the licences shown. Thank you to everyone who shared them.</p>
        </section>

        <ul className="photo-credits">
          {PHOTO_CREDITS.map((credit) => (
            <li key={credit.productId}>
              <strong>{getProduct(credit.productId)?.name ?? credit.title}:</strong>{" "}
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

        <Link href="/shop/" className="btn btn-outline">
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back to the shop
        </Link>
      </main>

      <SiteFooter />
    </div>
  );
}
