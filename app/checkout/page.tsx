import type { Metadata } from "next";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Practice Shop | Computer Steps",
  description: "Practise typing delivery details and paying with a pretend bank card.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
