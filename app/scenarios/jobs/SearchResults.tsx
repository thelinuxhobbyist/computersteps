"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useLearner } from "../../lib/learner-session";
import { VACANCIES } from "../../../workers/practice-bank/src/shared/job-catalogue";
import {
  CONTRACT_LABELS,
  EXPERIENCE_LABELS,
  SPONSORSHIP_LABELS,
  JOB_CATEGORIES,
  PAGE_SIZE,
  SALARY_BANDS,
  SORT_LABELS,
  WORKPLACE_LABELS,
  activeFilters,
  emptyJobQuery,
  explainEmptySearch,
  jobQueryString,
  parseJobQuery,
  refineJobQuery,
  searchJobs,
  type JobQuery,
} from "../../../workers/practice-bank/src/shared/jobs";
import { JobCard } from "./JobCard";
import { coursesForJobs } from "./job-skills";
import { getJobsAccount, saveVacancy, unsaveVacancy } from "./jobs-api";
import { readCompare, useCompareIds, writeCompare } from "./jobs-client";

function BoundDraft({
  query,
  children,
}: {
  query: JobQuery;
  children: (draft: JobQuery, setDraft: Dispatch<SetStateAction<JobQuery>>) => ReactNode;
}) {
  const [draft, setDraft] = useState(query);
  return children(draft, setDraft);
}

export function CompareButton({ jobId }: { jobId: string }) {
  const ids = useCompareIds();
  const [message, setMessage] = useState("");

  const selected = ids.includes(jobId);

  return (
    <div>
      <button
        type="button"
        className="wj-btn wj-btn--ghost"
        aria-pressed={selected}
        onClick={() => {
          const current = readCompare();
          if (current.includes(jobId)) {
            writeCompare(current.filter((id) => id !== jobId));
            setMessage("");
            return;
          }
          if (current.length >= 2) {
            setMessage("You can compare two jobs. Remove one from the comparison bar first.");
            return;
          }
          writeCompare([...current, jobId]);
          setMessage("Added. Open Compare jobs when you have two.");
        }}
      >
        {selected ? "Remove from comparison" : "Add to compare"}
      </button>
      {message ? (
        <p className="wj-help" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const saved = useSavedSet();
  const rawQuery = parseJobQuery(new URLSearchParams(params.toString()));
  const query = refineJobQuery(VACANCIES, rawQuery);
  useEffect(() => {
    const current = jobQueryString(rawQuery);
    const next = jobQueryString(query);
    if (current !== next) router.replace(`/scenarios/jobs/search/${next}`);
  }, [params, query, rawQuery, router]);
  const { total, results } = searchJobs(VACANCIES, query);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filters = activeFilters(query);
  const resultsHref = `/scenarios/jobs/search/${jobQueryString(query)}`;
  const courses = coursesForJobs(results);
  const chosenFilters = filters.filter((filter) => filter.key !== "q" && filter.key !== "where");
  const searching = Boolean(query.q || query.where || chosenFilters.length);
  const empty = total === 0 ? explainEmptySearch(VACANCIES, query) : null;

  const go = (next: JobQuery) => {
    router.push(`/scenarios/jobs/search/${jobQueryString(next)}`);
  };

  const pageHref = (page: number) => `/scenarios/jobs/search/${jobQueryString({ ...query, page })}`;

  return (
    <div className="ps-wrap">
      <h1>Search results</h1>
      <BoundDraft key={params.toString()} query={query}>
        {(draft) => (
          <>
      <div className="wj-board">
        <div>
          <button
            className="wj-btn wj-filter-toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="job-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? "Hide filters" : "Filters"}
            {chosenFilters.length ? ` (${chosenFilters.length})` : ""}
          </button>
          <form id="job-filters" className={filtersOpen ? "wj-filters is-open" : "wj-filters"}>
            <h2>Filters</h2>
            <Checks
              legend="Job category"
              name="category"
              value={query.category}
              options={JOB_CATEGORIES.map((category) => ({ id: category.id, label: category.label }))}
              onChange={(category) => go({ ...draft, category, page: 1 })}
            />
            <Checks
              legend="Salary"
              name="salary"
              value={query.salary}
              options={SALARY_BANDS.map((band) => ({ id: band.id, label: band.label }))}
              onChange={(salary) => go({ ...draft, salary, page: 1 })}
            />
            <p className="wj-help">Hourly jobs are matched by their yearly pay.</p>
            <Checks
              legend="Employment type"
              name="contract"
              value={query.contract}
              options={Object.entries(CONTRACT_LABELS).map(([id, label]) => ({ id, label }))}
              onChange={(contract) => go({ ...draft, contract, page: 1 })}
            />
            <Checks
              legend="Working hours"
              name="hours"
              value={query.hours}
              options={[
                { id: "full-time", label: "Full-time" },
                { id: "part-time", label: "Part-time" },
              ]}
              onChange={(hours) => go({ ...draft, hours, page: 1 })}
            />
            <Checks
              legend="Experience level"
              name="experience"
              value={query.experience}
              options={Object.entries(EXPERIENCE_LABELS).map(([id, label]) => ({ id, label }))}
              onChange={(experience) => go({ ...draft, experience, page: 1 })}
            />
            <Checks
              legend="Workplace"
              name="workplace"
              value={query.workplace}
              options={Object.entries(WORKPLACE_LABELS).map(([id, label]) => ({ id, label }))}
              onChange={(workplace) => go({ ...draft, workplace, page: 1 })}
            />
            <Checks
              legend="Visa sponsorship"
              name="sponsorship"
              value={query.sponsorship}
              options={Object.entries(SPONSORSHIP_LABELS).map(([id, label]) => ({ id, label }))}
              onChange={(sponsorship) => go({ ...draft, sponsorship, page: 1 })}
            />
            <p className="wj-help">Sponsorship details are part of these fictional adverts. They are not immigration advice.</p>
          </form>
        </div>

        <div>
          <div className="wj-results-head">
            <p role="status">
              <strong>{total === 1 ? "1 job" : `${total} jobs`}</strong>
            </p>
            <div className="wj-results-tools">
              {searching ? <Link href="/scenarios/jobs/search/">Clear search and filters</Link> : null}
            <div className="wj-field">
              <label htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={query.sort}
                onChange={(event) => go({ ...query, sort: event.target.value as JobQuery["sort"], page: 1 })}
              >
                {Object.entries(SORT_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>

          {filters.length ? (
            <ul className="wj-chips">
              {filters.map((filter) => (
                <li key={filter.key}>
                  <Link
                    aria-label={`Remove ${filter.label}`}
                    href={`/scenarios/jobs/search/${jobQueryString({ ...query, [filter.key]: "", page: 1 })}`}
                  >
                    {filter.label} <span aria-hidden="true">×</span>
                  </Link>
                </li>
              ))}
              {chosenFilters.length ? (
                <li>
                  <Link href={`/scenarios/jobs/search/${jobQueryString({ ...emptyJobQuery(), q: query.q, where: query.where })}`}>
                    Clear filters
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : null}

          {empty ? (
            <div role="status">
              <div className="wj-note">
                <h2>No jobs match this search</h2>
                <p>{empty.detail}</p>
                <div className="wj-job__actions">
                  {empty.alternatives[0] ? (
                    <Link className="wj-btn" href={`/scenarios/jobs/search/${jobQueryString(empty.alternatives[0].query)}`}>
                      {empty.alternatives[0].label}
                    </Link>
                  ) : null}
                  <Link className="wj-btn wj-btn--ghost" href="/scenarios/jobs/search/">
                    Clear search and filters
                  </Link>
                  {empty.alternatives.slice(1).map((alternative) => (
                    <Link key={alternative.label} className="wj-btn wj-btn--ghost" href={`/scenarios/jobs/search/${jobQueryString(alternative.query)}`}>
                      {alternative.label}
                    </Link>
                  ))}
                </div>
              </div>
              {empty.related ? (
                <section className="wj-related" aria-label="Related jobs">
                  <h2>Related jobs</h2>
                  <p>{empty.related.reason}</p>
                  {empty.related.jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      from={resultsHref}
                      actions={
                        <>
                          <SaveJobButton jobId={job.id} saved={saved} returnTo={resultsHref} />
                          <CompareButton jobId={job.id} />
                        </>
                      }
                    />
                  ))}
                </section>
              ) : null}
            </div>
          ) : results.length === 0 ? (
            <div className="wj-note" role="status">
              <h2>There are no jobs on this page</h2>
              <p>The earlier pages still have results.</p>
              <Link className="wj-btn" href={pageHref(1)}>
                Back to the first page
              </Link>
            </div>
          ) : (
            <>
              {courses.length ? (
                <aside className="wj-skills">
                  <p>Practise the computer skills these jobs use</p>
                  <ul>
                    {courses.map((course) => (
                      <li key={course.id}>
                        <Link href={course.href}>{course.title}</Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
              {results.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  from={resultsHref}
                  actions={
                    <>
                      <SaveJobButton jobId={job.id} saved={saved} returnTo={resultsHref} />
                      <CompareButton jobId={job.id} />
                    </>
                  }
                />
              ))}
            </>
          )}

          {total > PAGE_SIZE ? (
            <nav className="wj-pages" aria-label="Result pages">
              {query.page > 1 ? <Link href={pageHref(query.page - 1)}>Previous page</Link> : <span>Previous page</span>}
              <span aria-current="page">
                Page {Math.min(query.page, pages)} of {pages}
              </span>
              {query.page < pages ? <Link href={pageHref(query.page + 1)}>Next page</Link> : <span>Next page</span>}
            </nav>
          ) : null}
        </div>
      </div>
          </>
        )}
      </BoundDraft>
    </div>
  );
}

function Checks({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="wj-checks">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option.id}>
          <input
            type="checkbox"
            name={name}
            checked={value === option.id}
            onChange={() => onChange(value === option.id ? "" : option.id)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function useSavedSet() {
  const username = useLearner();
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    if (!username) return;
    let cancel = false;
    getJobsAccount(username).then((account) => {
      if (!cancel) setIds(account?.saved.map((item) => item.jobId) ?? []);
    });
    return () => {
      cancel = true;
    };
  }, [username]);
  return { username, ids, setIds };
}

function SaveJobButton({
  jobId,
  saved,
  returnTo,
}: {
  jobId: string;
  saved: ReturnType<typeof useSavedSet>;
  returnTo: string;
}) {
  const [busy, setBusy] = useState(false);
  const selected = saved.ids.includes(jobId);
  if (!saved.username) {
    return (
      <Link className="wj-btn wj-btn--ghost" href={`/scenarios/jobs/account/?next=${encodeURIComponent(returnTo)}`}>
        Save job
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="wj-btn wj-btn--ghost"
      aria-pressed={selected}
      disabled={busy}
      onClick={() => {
        const username = saved.username;
        if (!username) return;
        setBusy(true);
        const request = selected ? unsaveVacancy(username, jobId) : saveVacancy(username, jobId);
        request.then((next) => {
          setBusy(false);
          if (next) saved.setIds(next.map((item) => item.jobId));
        });
      }}
    >
      {selected ? "Saved" : "Save job"}
    </button>
  );
}
