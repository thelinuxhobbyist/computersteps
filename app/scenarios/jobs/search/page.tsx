import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "../SearchResults";

export const metadata: Metadata = { title: "Search results" };

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading search…</p>}>
      <SearchResults />
    </Suspense>
  );
}
