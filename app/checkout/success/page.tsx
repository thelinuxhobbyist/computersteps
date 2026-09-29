import type { Metadata } from "next";
import OrderConfirmation from "./OrderConfirmation";

export const metadata: Metadata = {
  title: "Order Complete | Practice Shop | Computer Steps",
  description: "Your practice order is complete. No real money was charged.",
};

export default function CheckoutSuccessPage() {
  return <OrderConfirmation />;
}
