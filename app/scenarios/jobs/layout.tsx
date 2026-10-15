import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "../practice-shell.css";
import "./jobs.css";
import JobsNav, { CompareBar, TaskBanner } from "./JobsNav";

export const metadata: Metadata = {
  title: { default: "Westford Jobs", template: "%s | Westford Jobs" },
  description: "A pretend UK recruitment website for practising job search, comparing vacancies and completing application forms.",
};

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ps ps--jobs wj">
      <a className="wj-skip" href="#wj-content">
        Skip to content
      </a>
      <div className="ps-note" role="note">
        <div className="ps-wrap">
          <p>
            <strong>Practice website.</strong> Westford Jobs lists fictional vacancies. Applications are not sent to employers.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <JobsNav />
      <TaskBanner />
      <CompareBar />
      <main id="wj-content" className="wj-main">
        {children}
      </main>
      <footer className="ps-footer">
        <div className="ps-wrap">
          <p>
            Westford Jobs is fictional. Practice applications, saved jobs and task progress are stored on your Computer Steps account and removed if the account is unused for a year. No employer is contacted.
          </p>
          <p>
            <Link href="/scenarios/jobs/exercises/">Guided exercises</Link>
            {" · "}
            <Link href="/scenarios/jobs/safety/">Spot a suspicious advert</Link>
            {" · "}
            <Link href="/scenarios/jobs/">About this practice</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
