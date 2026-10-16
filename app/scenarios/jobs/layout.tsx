import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import "../practice-shell.css";
import "./jobs.css";
import JobsNav, { CompareBar, TaskBanner } from "./JobsNav";
import { JobsSearchBar } from "./JobsSearchBar";

export const metadata: Metadata = {
  title: { default: "Westford Jobs", template: "%s | Westford Jobs" },
  description: "Search UK jobs by title and location, compare vacancies and apply online with Westford Jobs.",
};

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ps ps--jobs wj">
      <a className="wj-skip" href="#wj-content">
        Skip to main content
      </a>
      <JobsNav />
      <Suspense fallback={null}>
        <JobsSearchBar />
      </Suspense>
      <TaskBanner />
      <CompareBar />
      <main id="wj-content" className="wj-main">
        {children}
      </main>
      <footer className="wj-footer">
        <div className="ps-wrap">
          <p className="wj-footer__brand">Westford Jobs</p>
          <p>Search vacancies, save jobs and apply online.</p>
          <nav className="wj-footer__links" aria-label="Footer">
            <Link href="/scenarios/jobs/find/">Find jobs</Link>
            <Link href="/scenarios/jobs/categories/">Categories</Link>
            <Link href="/scenarios/jobs/saved/">Saved jobs</Link>
            <Link href="/scenarios/jobs/applications/">Applications</Link>
            <Link href="/scenarios/jobs/exercises/">Job search guides</Link>
            <Link href="/scenarios/jobs/safety/">Avoid job scams</Link>
          </nav>
          <p>&copy; 2026 Westford Jobs</p>
          <p className="wj-footer__practice">Practice site for learning to apply for jobs. These vacancies are not real.</p>
        </div>
      </footer>
    </div>
  );
}
