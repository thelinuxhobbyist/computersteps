import type { Metadata } from "next";
import Transactions from "./Transactions";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function TransactionsPage() {
  return <Transactions />;
}
