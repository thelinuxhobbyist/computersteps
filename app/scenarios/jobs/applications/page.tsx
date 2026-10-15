import type { Metadata } from "next";
import { Applications } from "../AccountViews";

export const metadata: Metadata = { title: "My applications" };

export default function ApplicationsPage() {
  return <Applications />;
}
