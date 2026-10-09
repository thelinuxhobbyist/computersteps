import type { Metadata } from "next";
import Usage from "./Usage";

export const metadata: Metadata = { title: "Energy usage" };

export default function UsagePage() {
  return <Usage />;
}
