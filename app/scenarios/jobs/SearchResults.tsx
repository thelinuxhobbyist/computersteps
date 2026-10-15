"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { VACANCIES } from "../../../workers/practice-bank/src/shared/job-catalogue";
import {
  CONTRACT_LABELS,
  EXPERIENCE_LABELS,
  JOB_CATEGORIES,
  PAGE_SIZE,
  SALARY_BANDS,
  SORT_LABELS,
  WORKPLACE_LABELS,
  activeFilters,
  emptyJobQuery,
  jobQueryString,
  parseJobQuery,
  searchJobs,
  type JobQuery,
} from "../../../workers/practice-bank/src/shared/jobs";
import { JobCard } from "./JobCard";
import { readCompare, useCompareIds, writeCompare } from "./jobs-client";
import { PlaceLookup } from "./PlaceLookup";

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
  const query = parseJobQuery(new URLSearchParams(params.toString()));
  const { total, results } = searchJobs(VACANCIES, query);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filters = activeFilters(query);
  const resultsHref = `/scenarios/jobs/search/${jobQueryString(query)}`;

  const go = (next: JobQuery) => {
    router.push(`/scenarios/jobs/search/${jobQueryString(next)}`);
  };

  const pageHref = (page: number) => `/scenarios/jobs/search/${jobQueryString({ ...query, page })}`;

  return (
    <div className="ps-wrap">
      <h1>Search results</h1>
      <BoundDraft key={params.toString()} query={query}>
        {(draft, setDraft) => (
          <>
      <form
        className="wj-search"
        onSubmit={(event) => {
          event.preventDefault();
          go({ ...draft, page: 1 });
        }}
      >
        <div className="wj-field">
          <label htmlFor="results-q">Job title, employer or keyword</label>
          <input
            id="results-q"
            value={draft.q}
            onChange={(event) => setDraft({ ...draft, q: event.target.value })}
          />
        </div>
        <PlaceLookup
          id="results-where"
          label="Town, city or postcode"
          value={draft.where}
          onChange={(where) => setDraft({ ...draft, where })}
          onPlace={(place) => setDraft({ ...draft, where: place.search })}
        />
        <button className="wj-btn wj-btn--accent" type="submit">
          Search jobs
        </button>
      </form>

      <div className="wj-split">
        <form
          className="wj-filters"
          onSubmit={(event) => {
            event.preventDefault();
            go({ ...draft, page: 1 });
          }}
        >
          <h2>Filters</h2>
          <div className="wj-field">
            <label htmlFor="filter-category">Job category</label>
            <select
              id="filter-category"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            >
              <option value="">Any category</option>
              {JOB_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="wj-field">
            <label htmlFor="filter-hours">Hours</label>
            <select id="filter-hours" value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })}>
              <option value="">Full-time or part-time</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>
          <div className="wj-field">
            <label htmlFor="filter-contract">Employment type</label>
            <select
              id="filter-contract"
              value={draft.contract}
              onChange={(event) => setDraft({ ...draft, contract: event.target.value })}
            >
              <option value="">Any employment type</option>
              {Object.entries(CONTRACT_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="wj-field">
            <label htmlFor="filter-salary">Salary</label>
            <select id="filter-salary" value={draft.salary} onChange={(event) => setDraft({ ...draft, salary: event.target.value })}>
              <option value="">Any salary</option>
              {SALARY_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
            <p className="wj-help">Hourly jobs are matched by their yearly pay.</p>
          </div>
          <div className="wj-field">
            <label htmlFor="filter-experience">Experience level</label>
            <select
              id="filter-experience"
              value={draft.experience}
              onChange={(event) => setDraft({ ...draft, experience: event.target.value })}
            >
              <option value="">Any experience</option>
              {Object.entries(EXPERIENCE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="wj-field">
            <label htmlFor="filter-workplace">Workplace</label>
            <select
              id="filter-workplace"
              value={draft.workplace}
              onChange={(event) => setDraft({ ...draft, workplace: event.target.value })}
            >
              <option value="">On-site, hybrid or remote</option>
              {Object.entries(WORKPLACE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="wj-btn" type="submit">
            Apply filters
          </button>
        </form>

        <div>
          <div className="wj-results-head">
            <p role="status">
              <strong>{total === 1 ? "1 job found" : `${total} jobs found`}</strong>
            </p>
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

          {filters.length ? (
            <ul className="wj-chips">
              {filters.map((filter) => (
                <li key={filter.key}>
                  <Link href={`/scenarios/jobs/search/${jobQueryString({ ...query, [filter.key]: "", page: 1 })}`}>
                    Remove {filter.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/scenarios/jobs/search/${jobQueryString(emptyJobQuery())}`}>Clear all</Link>
              </li>
            </ul>
          ) : null}

          {total === 0 ? (
            <div className="wj-note" role="status">
              <h2>No jobs match this search</h2>
              <p>Try a different job title, a shorter place name, or clear the filters.</p>
              <Link className="wj-btn" href="/scenarios/jobs/search/">
                Clear search and filters
              </Link>
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
            results.map((job) => (
              <JobCard key={job.id} job={job} from={resultsHref} actions={<CompareButton jobId={job.id} />} />
            ))
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
