import type { Metadata } from "next";
import LatestBill from "./LatestBill";

export const metadata: Metadata = { title: "Your latest bill" };

export default function BillsPage() {
  return <LatestBill />;
}
