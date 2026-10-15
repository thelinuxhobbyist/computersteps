import type { Metadata } from "next";
import Link from "next/link";
import { VACANCIES } from "../../../../workers/practice-bank/src/shared/job-catalogue";
import { EXAMPLE_SEARCHES, JOB_CATEGORIES, categoryLabel } from "../../../../workers/practice-bank/src/shared/jobs";
import { JobCard } from "../JobCard";

export const metadata: Metadata = { title: "Find jobs" };

export default function FindJobsPage() {
  const featured = VACANCIES.filter((job) => job.featured).slice(0, 6);
  return (
    <div className="ps-wrap">
      <h1>Find jobs</h1>
      <p className="wj-lead">
        Search fictional UK vacancies. This is a practice website for learning how job search works. The employers and the jobs are not real.
      </p>
      <form className="wj-search" action="/scenarios/jobs/search/" method="get">
        <div className="wj-field">
          <label htmlFor="q">Job title, employer or keyword</label>
          <input id="q" name="q" />
        </div>
        <div className="wj-field">
          <label htmlFor="where">Town, city or postcode</label>
          <input id="where" name="where" />
        </div>
        <button className="wj-btn wj-btn--accent" type="submit">
          Search jobs
        </button>
      </form>

      <h2>Browse by job category</h2>
      <div className="wj-cats">
        {JOB_CATEGORIES.map((category) => {
          const count = VACANCIES.filter((job) => job.category === category.id).length;
          return (
            <Link key={category.id} href={`/scenarios/jobs/search/?category=${category.id}`}>
              <span>{category.label}</span>
              <span>{count}</span>
            </Link>
          );
        })}
      </div>

      <h2>Example searches</h2>
      <div className="wj-cats">
        {EXAMPLE_SEARCHES.map((phrase) => (
          <Link key={phrase} href={`/scenarios/jobs/search/?q=${encodeURIComponent(phrase)}`}>
            {phrase}
          </Link>
        ))}
      </div>

      <h2>Example vacancies</h2>
      <p className="wj-help">A few of the practice jobs. The full list is in search results.</p>
      {featured.map((job) => (
        <JobCard key={job.id} job={job} from="/scenarios/jobs/find/" />
      ))}
      <p>
        Category names such as {categoryLabel("care")} are also in the{" "}
        <Link href="/scenarios/jobs/categories/">job categories</Link> list. When you are ready, try the{" "}
        <Link href="/scenarios/jobs/exercises/">guided exercises</Link>.
      </p>
    </div>
  );
}
