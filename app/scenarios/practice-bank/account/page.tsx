import type { Metadata } from "next";
import AccountOverview from "./AccountOverview";

export const metadata: Metadata = {
  title: "My account",
};

export default function AccountPage() {
  return <AccountOverview />;
}
