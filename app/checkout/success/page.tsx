import type { Metadata } from "next";
import OrderConfirmation from "./OrderConfirmation";
import { SHOP_NAME } from "../../shop/shop-data";

export const metadata: Metadata = {
  title: `Order Complete | ${SHOP_NAME} | Computer Steps`,
  description: "Your practice order is complete. No real money was charged.",
};

export default function CheckoutSuccessPage() {
  return <OrderConfirmation />;
}
