import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationView } from "../../AccountViews";

export const metadata: Metadata = { title: "Application" };

export default function ApplicationViewPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading application…</p>}>
      <ApplicationView />
    </Suspense>
  );
}
