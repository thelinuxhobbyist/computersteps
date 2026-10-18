import type { Metadata } from "next";
import BasketReview from "./BasketReview";
import { SHOP_NAME } from "../shop/shop-data";

export const metadata: Metadata = {
  title: `Your Basket | ${SHOP_NAME} | Computer Steps`,
  description: "Check the items in your practice basket, change quantities and see your delivery cost.",
};

export default function BasketPage() {
  return <BasketReview />;
}
