import type { Metadata } from "next";
import PaySomeone from "./PaySomeone";

export const metadata: Metadata = {
  title: "Pay a bill",
};

export default function PayPage() {
  return <PaySomeone />;
}
