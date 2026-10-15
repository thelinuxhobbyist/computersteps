import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "../practice-shell.css";
import "./jobs.css";
import JobsNav, { CompareBar, TaskBanner } from "./JobsNav";

export const metadata: Metadata = {
  title: { default: "Westford Jobs", template: "%s | Westford Jobs" },
  description: "Search UK jobs by title and location, compare vacancies and apply online with Westford Jobs.",
};

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ps ps--jobs wj">
      <a className="wj-skip" href="#wj-content">
        Skip to content
      </a>
      <JobsNav />
      <TaskBanner />
      <CompareBar />
      <main id="wj-content" className="wj-main">
        {children}
      </main>
      <footer className="wj-footer">
        <div className="ps-wrap">
          <p className="wj-footer__brand">Westford Jobs</p>
          <p>Search vacancies, save jobs and apply online.</p>
          <p>
            <Link href="/scenarios/jobs/find/">Find jobs</Link>
            {" · "}
            <Link href="/scenarios/jobs/categories/">Categories</Link>
            {" · "}
            <Link href="/scenarios/jobs/saved/">Saved jobs</Link>
            {" · "}
            <Link href="/scenarios/jobs/applications/">Applications</Link>
            {" · "}
            <Link href="/scenarios/jobs/exercises/">Job search guides</Link>
            {" · "}
            <Link href="/scenarios/jobs/safety/">Avoid job scams</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
