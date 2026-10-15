import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareJobs } from "../CompareJobs";

export const metadata: Metadata = { title: "Compare jobs" };

export default function ComparePage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading comparison…</p>}>
      <CompareJobs />
    </Suspense>
  );
}
