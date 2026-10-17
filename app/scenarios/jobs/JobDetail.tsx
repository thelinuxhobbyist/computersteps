"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLearner } from "../../lib/learner-session";
import { VACANCIES, findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import {
  CONTRACT_LABELS,
  EXPERIENCE_LABELS,
  HOURS_LABELS,
  WORKPLACE_LABELS,
  categoryLabel,
  formatLocation,
  formatUkDate,
  type Vacancy,
} from "../../../workers/practice-bank/src/shared/jobs";
import { coursesForJob } from "./job-skills";
import { CompareButton } from "./SearchResults";
import { getJobsAccount, saveVacancy, unsaveVacancy } from "./jobs-api";
import { safeJobsPath } from "./jobs-client";

function daysAgo(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const posted = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today - posted) / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

function similarJobs(job: Vacancy): Vacancy[] {
  const others = VACANCIES.filter((item) => item.id !== job.id && item.category === job.category);
  const nearby = others.filter((item) => item.city === job.city || item.town === job.town);
  const rest = others.filter((item) => item.city !== job.city && item.town !== job.town);
  return [...nearby, ...rest].slice(0, 4);
}

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
  const applyHref = `/scenarios/jobs/apply/?id=${job.id}`;
  const employerHref = `/scenarios/jobs/search/?q=${encodeURIComponent(job.employer)}`;
  const moreHref = `/scenarios/jobs/search/?q=${encodeURIComponent(job.title)}&where=${encodeURIComponent(job.town)}`;
  const courses = coursesForJob(job);
  const similar = similarJobs(job);
  const whereLine = job.postcode ? `${formatLocation(job)}, ${job.postcode}` : formatLocation(job);
  const shift = job.hoursDetail.split(/[.,]/)[0]?.trim() ?? "";

  const save = async () => {
    if (!username) return;
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
  };

  return (
    <div className="ps-wrap">
      <p className="wj-crumbs">
        <Link href={back}>← Back to search results</Link>
      </p>
      <div className="wj-layout">
        <div>
          <section className="wj-card wj-summary" aria-label="Job summary">
            <div className="wj-summary__top">
              <div className="wj-badge" aria-hidden="true">
                {job.employer.trim().charAt(0).toUpperCase()}
              </div>
              <div>
                <h1>{job.title}</h1>
                <p className="wj-summary__company">
                  <Link href={employerHref}>{job.employer}</Link>
                </p>
                <p className="wj-summary__loc">{whereLine}</p>
              </div>
            </div>
            <p className="wj-summary__pay">{job.payLabel}</p>
            <p className="wj-practice-flag">Practice vacancy. This employer and this job are fictional.</p>
            <ul className="wj-tags">
              <li>{HOURS_LABELS[job.hours]}</li>
              <li>{CONTRACT_LABELS[job.contract]}</li>
              <li>{WORKPLACE_LABELS[job.workplace]}</li>
              {shift && shift.length <= 42 ? <li>{shift}</li> : null}
            </ul>
            <div className="wj-actions">
              {closed ? (
                <p className="wj-summary__closed">The closing date has passed.</p>
              ) : (
                <Link className="wj-btn" href={applyHref}>
                  Apply now
                </Link>
              )}
              {username ? (
                <button type="button" className="wj-btn wj-btn--ghost" disabled={busy} onClick={save}>
                  {saved ? "Job saved" : "Save job"}
                </button>
              ) : (
                <Link className="wj-btn wj-btn--ghost" href={signInHref}>
                  Sign in to save this job
                </Link>
              )}
              <CompareButton jobId={job.id} />
            </div>
            {message ? (
              <p role="status">
                <strong>{message}</strong>
              </p>
            ) : null}
            <p className="wj-posted">
              {daysAgo(job.postedOn)} · Closes {formatUkDate(job.closesOn)} · Ref: {job.reference}
            </p>
          </section>

          {courses.length ? (
            <div className="wj-practice">
              <strong>Practise the computer skills for this job:</strong>
              {courses.map((course) => (
                <Link key={course.id} href={course.href}>
                  {course.title}
                </Link>
              ))}
            </div>
          ) : null}

          <section className="wj-card wj-desc" aria-label="Job description">
            <h2>Job description</h2>
            <p>{job.summary}</p>
            {job.entryLevel ? <p>This role is suitable for entry-level applicants.</p> : null}
            <h3>Key responsibilities:</h3>
            <ul>
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Essential requirements</h3>
            <ul>
              {job.essential.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Desirable skills</h3>
            <ul>
              {job.desirable.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Qualifications</h3>
            <ul>
              {job.qualifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {job.benefits.length ? (
              <>
                <h3>Benefits</h3>
                <ul>
                  {job.benefits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <h3>Right to work</h3>
            <p>{job.rightToWork}</p>
            <h3>How to apply</h3>
            <p>{job.howToApply}</p>
            <p>Hours: {job.hoursDetail.replace(/\.+$/, "").trim()}.</p>
            {closed ? null : (
              <div className="wj-actions">
                <Link className="wj-btn" href={applyHref}>
                  Apply now
                </Link>
              </div>
            )}
            <p className="wj-scam">
              <strong>Stay safe.</strong> Westford Jobs will not ask you to pay a fee, or to send bank details or identity documents, in order to apply. If an advert asks for those things, treat it as a warning sign.{" "}
              <Link href="/scenarios/jobs/safety/">Avoid job scams</Link>
            </p>
          </section>

          <section className="wj-card" aria-label="Job details">
            <h2>Job details</h2>
            <dl className="wj-details">
              <dt>Company</dt>
              <dd>{job.employer}</dd>
              <dt>Location</dt>
              <dd>{formatLocation(job)}</dd>
              <dt>Job type</dt>
              <dd>
                {CONTRACT_LABELS[job.contract]}, {HOURS_LABELS[job.hours].toLowerCase()}
              </dd>
              <dt>Salary</dt>
              <dd>{job.payLabel}</dd>
              <dt>Sponsorship</dt>
              <dd>{job.sponsorship === "available" ? "May be available. Read the conditions." : "Not offered"}</dd>
              <dt>Experience</dt>
              <dd>{EXPERIENCE_LABELS[job.experience]}</dd>
              <dt>Right to work</dt>
              <dd>{job.rightToWork}</dd>
              <dt>Category</dt>
              <dd>{categoryLabel(job.category)}</dd>
              <dt>Posted</dt>
              <dd>{formatUkDate(job.postedOn)}</dd>
              <dt>Closes</dt>
              <dd>{formatUkDate(job.closesOn)}</dd>
              <dt>Reference</dt>
              <dd>{job.reference}</dd>
            </dl>
          </section>
        </div>

        <aside className="wj-side">
          {similar.length ? (
            <section className="wj-card" aria-label="Similar jobs">
              <h2>Similar jobs</h2>
              <ul>
                {similar.map((item) => (
                  <li key={item.id}>
                    <Link href={`/scenarios/jobs/job/?id=${item.id}`}>{item.title}</Link>
                    <p>
                      {item.employer} · {formatLocation(item)}
                      <br />
                      {item.payLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="wj-card" aria-label="More jobs like this">
            <h2>More jobs like this</h2>
            <p>Search for more {job.title.toLowerCase()} jobs in {job.town}.</p>
            <Link className="wj-btn wj-btn--ghost wj-btn--block" href={moreHref}>
              See jobs like this
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
