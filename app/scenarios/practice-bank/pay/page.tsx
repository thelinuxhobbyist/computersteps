import type { Metadata } from "next";
import PaySomeone from "./PaySomeone";

export const metadata: Metadata = {
  title: "Transfer money",
};

export default function PayPage() {
  return <PaySomeone />;
}
