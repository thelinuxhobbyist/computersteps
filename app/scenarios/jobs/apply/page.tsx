import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplyForm } from "../ApplyForm";

export const metadata: Metadata = { title: "Apply" };

export default function ApplyPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading application form…</p>}>
      <ApplyForm />
    </Suspense>
  );
}
