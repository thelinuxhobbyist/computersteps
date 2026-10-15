import type { Metadata } from "next";
import Link from "next/link";
import { EXERCISE_LEVELS, JOB_EXERCISES } from "../../../workers/practice-bank/src/shared/job-exercises";

export const metadata: Metadata = {
  title: "About this practice",
  description: "Practise searching for jobs, comparing vacancies and completing application forms on a simulated UK recruitment website.",
};

export default function JobsIntroPage() {
  return (
    <div className="ps-wrap">
      <p className="wj-help">New practice scenario</p>
      <h1>Practise looking for work</h1>
      <p className="wj-lead">
        Westford Jobs is a fictional UK recruitment website. You can search vacancies, compare them, save jobs and complete application forms. Nothing is sent to a real employer.
      </p>
      <h2>What you can practise</h2>
      <ul>
        <li>Searching by job title and location</li>
        <li>Using filters such as hours, pay and experience</li>
        <li>Reading a job advert, including the pay and the closing date</li>
        <li>Saving a job and finding it again</li>
        <li>Completing a multi-step application and reviewing it before you submit</li>
        <li>Reading a practice interview invitation</li>
        <li>Spotting warning signs in a suspicious advert</li>
      </ul>
      <div className="wj-actions">
        <Link className="wj-btn wj-btn--accent" href="/scenarios/jobs/find/">
          Explore the job website
        </Link>
        <Link className="wj-btn" href="/scenarios/jobs/exercises/">
          Start guided exercises
        </Link>
      </div>
      <h2>Exercises</h2>
      <div className="wj-grid">
        {EXERCISE_LEVELS.map((level) => (
          <article className="wj-card" key={level.id} style={{ padding: 16 }}>
            <h3>{level.label}</h3>
            <p>{level.summary}</p>
            <p>{JOB_EXERCISES.filter((exercise) => exercise.level === level.id).length} tasks</p>
          </article>
        ))}
      </div>
      <p>
        You can also <Link href="/scenarios/jobs/safety/">read how to spot a suspicious advert</Link> before you try the safety tasks.
      </p>
    </div>
  );
}
