import type { Metadata } from "next";
import BillHistory from "./BillHistory";

export const metadata: Metadata = { title: "Previous bills" };

export default function BillHistoryPage() {
  return <BillHistory />;
}
