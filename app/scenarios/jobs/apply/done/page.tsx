import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplyDone } from "../../AccountViews";

export const metadata: Metadata = { title: "Application saved" };

export default function ApplyDonePage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading confirmation…</p>}>
      <ApplyDone />
    </Suspense>
  );
}
