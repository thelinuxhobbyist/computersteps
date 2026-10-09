import type { Metadata } from "next";
import DirectDebit from "./DirectDebit";

export const metadata: Metadata = { title: "Direct Debit" };

export default function DirectDebitPage() {
  return <DirectDebit />;
}
