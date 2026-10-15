import type { Metadata } from "next";
import { Suspense } from "react";
import { ExerciseTask } from "../../ExerciseViews";

export const metadata: Metadata = { title: "Job search guide" };

export default function ExerciseTaskPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading task…</p>}>
      <ExerciseTask />
    </Suspense>
  );
}
