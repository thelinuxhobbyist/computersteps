import type { Metadata } from "next";
import PaymentHistory from "./PaymentHistory";

export const metadata: Metadata = { title: "Payment history" };

export default function PaymentHistoryPage() {
  return <PaymentHistory />;
}
