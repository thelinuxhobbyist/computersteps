import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountHome } from "../AccountViews";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading account…</p>}>
      <AccountHome />
    </Suspense>
  );
}
