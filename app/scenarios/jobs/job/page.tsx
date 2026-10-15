import type { Metadata } from "next";
import { Suspense } from "react";
import { JobDetail } from "../JobDetail";

export const metadata: Metadata = { title: "Job details" };

export default function JobPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading job…</p>}>
      <JobDetail />
    </Suspense>
  );
}
