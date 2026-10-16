import Link from "next/link";
import type { ReactNode } from "react";
import type { Vacancy } from "../../../workers/practice-bank/src/shared/jobs";
import { CONTRACT_LABELS, HOURS_LABELS, WORKPLACE_LABELS, formatLocation, formatUkDate } from "../../../workers/practice-bank/src/shared/jobs";

export function JobCard({ job, actions, from }: { job: Vacancy; actions?: ReactNode; from?: string }) {
  const href = from ? `/scenarios/jobs/job/?id=${job.id}&from=${encodeURIComponent(from)}` : `/scenarios/jobs/job/?id=${job.id}`;
  return (
    <article className="wj-job">
      <div className="wj-job__top">
        <div className="wj-badge" aria-hidden="true">
          {job.employer.trim().charAt(0).toUpperCase()}
        </div>
        <div className="wj-job__identity">
          <h3>
            <Link className="wj-job__title" href={href}>
              {job.title}
            </Link>
          </h3>
          <p className="wj-job__employer">{job.employer}</p>
          <p className="wj-job__where">{formatLocation(job)}</p>
        </div>
        <p className="wj-pay">{job.payLabel}</p>
      </div>
      <ul className="wj-meta">
        <li>{HOURS_LABELS[job.hours]}</li>
        <li>{CONTRACT_LABELS[job.contract]}</li>
        <li>{WORKPLACE_LABELS[job.workplace]}</li>
        {job.entryLevel ? <li>Entry level</li> : null}
      </ul>
      <p className="wj-job__summary">{job.summary}</p>
      <div className="wj-job__foot">
        <p>
          Posted {formatUkDate(job.postedOn)} · Ref: {job.reference}
        </p>
        <div className="wj-job__actions">
          <Link className="wj-btn" href={href}>
            View vacancy
          </Link>
          {actions}
        </div>
      </div>
    </article>
  );
}
