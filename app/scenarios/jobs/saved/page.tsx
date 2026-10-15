import type { Metadata } from "next";
import { SavedJobs } from "../AccountViews";

export const metadata: Metadata = { title: "Saved jobs" };

export default function SavedPage() {
  return <SavedJobs />;
}
