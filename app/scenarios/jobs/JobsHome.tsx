import Link from "next/link";
import { VACANCIES } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { EXAMPLE_SEARCHES, JOB_CATEGORIES } from "../../../workers/practice-bank/src/shared/jobs";
import { JobCard } from "./JobCard";
import { PlaceLookup } from "./PlaceLookup";

export function JobsHome() {
  const featured = VACANCIES.filter((job) => job.featured).slice(0, 6);
  return (
    <>
      <section className="wj-hero">
        <div className="ps-wrap">
          <h1>Find your next job</h1>
          <p className="wj-lead">Search jobs by title and location. Save the ones you want and apply online.</p>
          <form className="wj-search" action="/scenarios/jobs/search/" method="get">
            <div className="wj-field">
              <label htmlFor="q">Job title, employer or keyword</label>
              <input id="q" name="q" placeholder="Job title, skill or company" />
            </div>
            <PlaceLookup id="where" name="where" label="Town, city or postcode" />
            <button className="wj-btn wj-btn--accent" type="submit">
              Search jobs
            </button>
          </form>
        </div>
      </section>
      <div className="ps-wrap">
        <h2>Browse by category</h2>
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

        <h2>Popular searches</h2>
        <div className="wj-pills">
          {EXAMPLE_SEARCHES.map((phrase) => (
            <Link key={phrase} href={`/scenarios/jobs/search/?q=${encodeURIComponent(phrase)}`}>
              {phrase}
            </Link>
          ))}
        </div>

        <h2>Jobs you might like</h2>
        {featured.map((job) => (
          <JobCard key={job.id} job={job} from="/scenarios/jobs/find/" />
        ))}
      </div>
    </>
  );
}
