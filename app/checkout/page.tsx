import type { Metadata } from "next";
import CheckoutForm from "./CheckoutForm";
import { SHOP_NAME } from "../shop/shop-data";

export const metadata: Metadata = {
  title: `Checkout | ${SHOP_NAME} | Computer Steps`,
  description: "Practise typing delivery details and paying with a pretend bank card.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
