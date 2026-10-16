"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLearner } from "../../lib/learner-session";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import {
  CONTRACT_LABELS,
  EXPERIENCE_LABELS,
  HOURS_LABELS,
  WORKPLACE_LABELS,
  categoryLabel,
  formatLocation,
  formatUkDate,
} from "../../../workers/practice-bank/src/shared/jobs";
import { coursesForJob } from "./job-skills";
import { CompareButton } from "./SearchResults";
import { getJobsAccount, saveVacancy, unsaveVacancy } from "./jobs-api";
import { safeJobsPath } from "./jobs-client";

export function JobDetail() {
  const params = useSearchParams();
  const username = useLearner();
  const job = findVacancy(params.get("id") ?? "");
  const back = safeJobsPath(params.get("from")) ?? "/scenarios/jobs/search/";
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!username || !job) return;
    let cancelled = false;
    getJobsAccount(username).then((account) => {
      if (!cancelled) setSaved(account?.saved.some((item) => item.jobId === job.id) ?? false);
    });
    return () => {
      cancelled = true;
    };
  }, [username, job]);

  if (!job) {
    return (
      <div className="ps-wrap">
        <h1>Job not found</h1>
        <p>That job is no longer listed. Go back to search and choose another vacancy.</p>
        <Link className="wj-btn" href="/scenarios/jobs/search/">
          Back to search results
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const closed = job.closesOn < today;
  const signInHref = `/scenarios/jobs/account/?next=${encodeURIComponent(safeJobsPath(`/scenarios/jobs/job/?id=${job.id}`) ?? "/scenarios/jobs/find/")}`;

  return (
    <div className="ps-wrap">
      <p>
        <Link href={back}>← Back to search results</Link>
      </p>
      <div className="wj-split">
        <article className="wj-prose">
          <h1>{job.title}</h1>
          <p className="wj-job__employer">{job.employer}</p>
          <p>
            {formatLocation(job)}
            {job.postcode ? ` · ${job.postcode}` : ""}
          </p>
          <p className="wj-pay">{job.payLabel}</p>
          <ul className="wj-meta">
            <li>{HOURS_LABELS[job.hours]}</li>
            <li>{CONTRACT_LABELS[job.contract]}</li>
            <li>{WORKPLACE_LABELS[job.workplace]}</li>
            <li>{EXPERIENCE_LABELS[job.experience]}</li>
            <li>{categoryLabel(job.category)}</li>
          </ul>
          <p>{job.summary}</p>
          {coursesForJob(job).length ? (
            <aside className="wj-skills">
              <p>Practise the computer skills for this job</p>
              <ul>
                {coursesForJob(job).map((course) => (
                  <li key={course.id}>
                    <Link href={course.href}>{course.title}</Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
          {job.entryLevel ? <p>This role is suitable for entry-level applicants.</p> : null}
          <div className="wj-note" role="note">
            <p>
              Westford Jobs will not ask you to pay a fee, or to send bank details or identity documents, in order to apply. If an advert asks for those things, treat it as a warning sign.
            </p>
          </div>
          <h2>The work</h2>
          <ul>
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>Essential requirements</h2>
          <ul>
            {job.essential.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>Desirable skills or experience</h2>
          <ul>
            {job.desirable.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>Experience and qualifications</h2>
          <ul>
            {job.qualifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>How to apply</h2>
          <p>
            Select Apply for this job and complete the application. You can review your answers before you submit.
          </p>
          {closed ? <p>The closing date has passed.</p> : null}
        </article>
        <aside className="wj-aside">
          <h2>Job facts</h2>
          <dl className="wj-facts">
            <dt>Reference</dt>
            <dd>{job.reference}</dd>
            <dt>Posted</dt>
            <dd>{formatUkDate(job.postedOn)}</dd>
            <dt>Apply by</dt>
            <dd>{formatUkDate(job.closesOn)}</dd>
            <dt>Hours</dt>
            <dd>{job.hoursDetail}</dd>
            <dt>Pay</dt>
            <dd>{job.payLabel}</dd>
          </dl>
          <Link className="wj-btn wj-btn--accent" href={`/scenarios/jobs/apply/?id=${job.id}`}>
            Apply for this job
          </Link>
          {username ? (
            <button
              type="button"
              className="wj-btn wj-btn--ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setMessage("");
                if (saved) {
                  if (!window.confirm("Remove this job from Saved jobs?")) {
                    setBusy(false);
                    return;
                  }
                  const next = await unsaveVacancy(username, job.id);
                  setSaved(next ? next.some((item) => item.jobId === job.id) : saved);
                  setMessage(next ? "Removed from Saved jobs." : "The job could not be removed. Check your connection and try again.");
                } else {
                  const next = await saveVacancy(username, job.id);
                  setSaved(next ? true : saved);
                  setMessage(next ? "Saved. You can find it again in Saved jobs." : "The job could not be saved. Check your connection and try again.");
                }
                setBusy(false);
              }}
            >
              {saved ? "Remove saved job" : "Save job"}
            </button>
          ) : (
            <div className="wj-note" role="status">
              <p>Sign in to save this job. You will come back to this advert afterwards.</p>
              <Link href={signInHref}>Sign in to save this job</Link>
            </div>
          )}
          {message ? (
            <p role="status">
              <strong>{message}</strong>
            </p>
          ) : null}
          <CompareButton jobId={job.id} />
        </aside>
      </div>
    </div>
  );
}
