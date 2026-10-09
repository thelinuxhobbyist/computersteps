import type { Metadata } from "next";
import PaymentsOverview from "./PaymentsOverview";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return <PaymentsOverview />;
}
