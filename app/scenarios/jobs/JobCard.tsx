import Link from "next/link";
import type { ReactNode } from "react";
import type { Vacancy } from "../../../workers/practice-bank/src/shared/jobs";
import { CONTRACT_LABELS, HOURS_LABELS, WORKPLACE_LABELS, formatLocation, formatUkDate } from "../../../workers/practice-bank/src/shared/jobs";

export function JobCard({ job, actions, from }: { job: Vacancy; actions?: ReactNode; from?: string }) {
  const href = from ? `/scenarios/jobs/job/?id=${job.id}&from=${encodeURIComponent(from)}` : `/scenarios/jobs/job/?id=${job.id}`;
  return (
    <article className="wj-job">
      <h3>
        <Link className="wj-job__title" href={href}>
          {job.title}
        </Link>
      </h3>
      <p className="wj-job__employer">{job.employer}</p>
      <p>{formatLocation(job)}</p>
      <p className="wj-pay">{job.payLabel}</p>
      <ul className="wj-meta">
        <li>{HOURS_LABELS[job.hours]}</li>
        <li>{CONTRACT_LABELS[job.contract]}</li>
        <li>{WORKPLACE_LABELS[job.workplace]}</li>
        {job.entryLevel ? <li>Entry level</li> : null}
      </ul>
      <p>{job.summary}</p>
      <p>
        Posted {formatUkDate(job.postedOn)} · Apply by {formatUkDate(job.closesOn)} · Reference {job.reference}
      </p>
      {actions}
    </article>
  );
}
