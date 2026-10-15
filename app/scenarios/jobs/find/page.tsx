import type { Metadata } from "next";
import { JobsHome } from "../JobsHome";

export const metadata: Metadata = { title: "Find jobs" };

export default function FindJobsPage() {
  return <JobsHome />;
}
