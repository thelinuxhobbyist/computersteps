import type { Metadata } from "next";
import BasketReview from "./BasketReview";

export const metadata: Metadata = {
  title: "Your Basket | Practice Shop | Computer Steps",
  description: "Check the items in your practice basket, change quantities and see your delivery cost.",
};

export default function BasketPage() {
  return <BasketReview />;
}
