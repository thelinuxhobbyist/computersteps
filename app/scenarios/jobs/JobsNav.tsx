"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearLearner, useLearner } from "../../lib/learner-session";
import { getPublicExercise } from "../../../workers/practice-bank/src/shared/job-exercises";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { clearTask, useCompareIds, useRememberedTask, writeCompare } from "./jobs-client";

const BROWSE = [
  ["Find jobs", "/scenarios/jobs/find/", "find"],
  ["Categories", "/scenarios/jobs/categories/", "categories"],
] as const;

const ACCOUNT = [
  ["Saved jobs", "/scenarios/jobs/saved/", "saved"],
  ["Applications", "/scenarios/jobs/applications/", "applications"],
] as const;

function sectionFor(path: string): string {
  if (path.includes("/categories")) return "categories";
  if (path.includes("/saved")) return "saved";
  if (path.includes("/applications")) return "applications";
  if (path.includes("/account")) return "account";
  if (path.includes("/exercises") || path.includes("/safety")) return "";
  if (path.endsWith("/scenarios/jobs/") || path.includes("/find") || path.includes("/search") || path.includes("/job")) return "find";
  return "find";
}

export default function JobsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const username = useLearner();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const section = sectionFor(path);
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(path);
  if (menuPath !== path) {
    setMenuPath(path);
    setOpen(false);
  }

  return (
    <header className="ps-header wj-header">
      <div className="ps-wrap wj-header__row">
        <Link href="/scenarios/jobs/find/" className="wj-logo">
          westford<span>jobs</span>
        </Link>
        <nav id="wj-menu" className={`wj-nav${open ? " is-open" : ""}`} aria-label="Westford Jobs">
          <div className="wj-nav__browse">
            {BROWSE.map(([label, href, id]) => (
              <Link key={href} href={href} aria-current={section === id ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </div>
          <div className="wj-nav__account">
            {ACCOUNT.map(([label, href, id]) => (
              <Link key={href} href={href} aria-current={section === id ? "page" : undefined}>
                {label}
              </Link>
            ))}
            {username ? (
              <Link href="/scenarios/jobs/account/" aria-current={section === "account" ? "page" : undefined}>
                {username}
              </Link>
            ) : null}
          </div>
        </nav>
        <div className="wj-header__actions">
          {username ? (
            <button
              type="button"
              className="wj-nav__signout"
              onClick={() => {
                if (!window.confirm("Sign out on this device?")) return;
                clearLearner();
                router.push("/scenarios/jobs/find/");
              }}
            >
              Sign out
            </button>
          ) : (
            <Link href="/scenarios/jobs/account/" className="wj-btn wj-signin">
              Sign in
            </Link>
          )}
          <button
            type="button"
            className="wj-nav__toggle"
            aria-expanded={open}
            aria-controls="wj-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}

export function TaskBanner() {
  const taskId = useRememberedTask();
  const task = taskId ? getPublicExercise(taskId) : undefined;
  if (!task) return null;
  return (
    <div className="wj-banner">
      <div className="ps-wrap">
        <p>
          <strong>Task {task.number}.</strong> {task.task}
        </p>
        <Link href={`/scenarios/jobs/exercises/task/?id=${task.id}`}>Back to the task</Link>
        <button
          type="button"
          className="wj-btn wj-btn--ghost"
          onClick={() => {
            clearTask();
          }}
        >
          Hide this reminder
        </button>
      </div>
    </div>
  );
}

export function CompareBar() {
  const ids = useCompareIds();
  if (!ids.length) return null;
  const names = ids.map((id) => findVacancy(id)?.title ?? "Job");
  return (
    <div className="wj-compare-bar">
      <div className="ps-wrap">
        <p>
          {ids.length === 1 ? "1 job selected to compare." : `Comparing: ${names.join(" and ")}.`}
        </p>
        <Link className="wj-btn wj-btn--accent" href={`/scenarios/jobs/compare/?ids=${ids.join(",")}`}>
          Compare jobs
        </Link>
        <button
          type="button"
          className="wj-btn wj-btn--ghost"
          onClick={() => {
            writeCompare([]);
          }}
        >
          Clear comparison
        </button>
      </div>
    </div>
  );
}
