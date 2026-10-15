import type { Metadata } from "next";
import Link from "next/link";
import { VACANCIES } from "../../../../workers/practice-bank/src/shared/job-catalogue";
import { JOB_CATEGORIES } from "../../../../workers/practice-bank/src/shared/jobs";

export const metadata: Metadata = { title: "Job categories" };

export default function CategoriesPage() {
  return (
    <div className="ps-wrap">
      <h1>Job categories</h1>
      <p className="wj-lead">Choose a type of work to see the fictional vacancies in that category. You can add more filters on the results page.</p>
      <div className="wj-cats">
        {JOB_CATEGORIES.map((category) => {
          const count = VACANCIES.filter((job) => job.category === category.id).length;
          return (
            <Link key={category.id} href={`/scenarios/jobs/search/?category=${category.id}`}>
              <span>{category.label}</span>
              <span>{count === 1 ? "1 job" : `${count} jobs`}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
