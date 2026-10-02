import type { Metadata } from "next";
import Statements from "./Statements";

export const metadata: Metadata = {
  title: "Statements",
};

export default function StatementsPage() {
  return <Statements />;
}
