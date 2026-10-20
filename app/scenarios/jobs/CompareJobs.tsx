"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import {
  CONTRACT_LABELS,
  EXPERIENCE_LABELS,
  HOURS_LABELS,
  WORKPLACE_LABELS,
  formatLocation,
} from "../../../workers/practice-bank/src/shared/jobs";

export function CompareJobs() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 2);
  const jobs = ids.map((id) => findVacancy(id)).filter((job) => job !== undefined);

  return (
    <div className="ps-wrap">
      <h1>Compare jobs</h1>
      <p className="wj-lead">Compare two jobs side by side. Look at the pay, the hours and the essential requirements before you decide.</p>
      {jobs.length < 2 ? (
        <div className="wj-note" role="status">
          <p>Choose two jobs. On a search result or a job advert, select Add to compare, then open Compare jobs.</p>
          <Link className="wj-btn" href="/scenarios/jobs/search/">
            Find jobs
          </Link>
        </div>
      ) : (
        <div className="wj-columns">
          {jobs.map((job) => (
            <article className="wj-card" key={job.id} style={{ padding: 16 }}>
              <h2>
                <Link href={`/scenarios/jobs/job/?id=${job.id}`}>{job.title}</Link>
              </h2>
              <p className="wj-job__employer">{job.employer}</p>
              <dl className="wj-facts">
                <dt>Location</dt>
                <dd>{formatLocation(job)}</dd>
                <dt>Pay</dt>
                <dd>{job.payLabel}</dd>
                <dt>Hours</dt>
                <dd>
                  {HOURS_LABELS[job.hours]}. {job.hoursDetail}
                </dd>
                <dt>Employment</dt>
                <dd>
                  {CONTRACT_LABELS[job.contract]} · {WORKPLACE_LABELS[job.workplace]}
                </dd>
                <dt>Experience</dt>
                <dd>{EXPERIENCE_LABELS[job.experience]}</dd>
                <dt>Right to work</dt>
                <dd>{job.rightToWork}</dd>
              </dl>
              <h3>Essential requirements</h3>
              <ul>
                {job.essential.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>Qualifications</h3>
              <ul>
                {job.qualifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
