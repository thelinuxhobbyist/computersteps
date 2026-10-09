import type { Metadata } from "next";
import PayBill from "./PayBill";

export const metadata: Metadata = { title: "Pay online" };

export default function PayPage() {
  return <PayBill />;
}
