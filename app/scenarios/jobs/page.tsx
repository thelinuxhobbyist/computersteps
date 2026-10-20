import type { Metadata } from "next";
import { JobsHome } from "./JobsHome";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Search UK jobs by title and location, compare jobs and apply online with Westford Jobs.",
};

export default function JobsIntroPage() {
  return <JobsHome />;
}
