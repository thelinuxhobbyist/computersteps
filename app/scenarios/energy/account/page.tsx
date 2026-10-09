import type { Metadata } from "next";
import AccountOverview from "./AccountOverview";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return <AccountOverview />;
}
