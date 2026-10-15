"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLearner } from "../../lib/learner-session";
import { EXERCISE_LEVELS, JOB_EXERCISES, getPublicExercise } from "../../../workers/practice-bank/src/shared/job-exercises";
import { checkPracticeTask, getJobsAccount } from "./jobs-api";
import { rememberTask } from "./jobs-client";

export function ExerciseList() {
  const username = useLearner();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (!username) return;
    getJobsAccount(username).then((account) => setDone(account?.exercises.map((item) => item.id) ?? []));
  }, [username]);

  return (
    <div className="ps-wrap">
      <h1>Job search guides</h1>
      <p className="wj-lead">
        Work through a search, an application or a suspicious advert, then check what you found. A hint points you to the right page.
      </p>
      {!username ? <p>Sign in if you want completed tasks to be saved on your account. You can still try the questions first.</p> : null}
      {EXERCISE_LEVELS.map((level) => (
        <section className="wj-level" key={level.id} aria-labelledby={`level-${level.id}`}>
          <h2 id={`level-${level.id}`}>{level.label}</h2>
          <p>{level.summary}</p>
          <div className="wj-grid">
            {JOB_EXERCISES.filter((exercise) => exercise.level === level.id).map((exercise) => (
              <Link className="wj-task" key={exercise.id} href={`/scenarios/jobs/exercises/task/?id=${exercise.id}`}>
                <span>
                  Task {exercise.number}
                  {done.includes(exercise.id) ? " · Completed" : ""}
                </span>
                <strong>{exercise.title}</strong>
                <span>{exercise.task}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ExerciseTask() {
  const params = useSearchParams();
  const router = useRouter();
  const username = useLearner();
  const exercise = getPublicExercise(params.get("id") ?? "");
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  if (!exercise) {
    return (
      <div className="ps-wrap">
        <h1>Task not found</h1>
        <p>Choose a task from the exercise list.</p>
        <Link className="wj-btn" href="/scenarios/jobs/exercises/">
          All exercises
        </Link>
      </div>
    );
  }

  const check = exercise.check;
  const multiple = check.kind === "choice" && check.multiple === true;

  const submit = async () => {
    setBusy(true);
    setProblem("");
    const response = await checkPracticeTask(username ?? null, exercise.id, answer, selected);
    setBusy(false);
    if (!response) {
      setProblem("The check could not be completed. Check your connection and try again.");
      return;
    }
    setResult({ correct: response.correct, feedback: response.feedback });
  };

  return (
    <div className="ps-wrap">
      <p>
        <Link href="/scenarios/jobs/exercises/">← All exercises</Link>
      </p>
      <p>
        Task {exercise.number} · {EXERCISE_LEVELS.find((level) => level.id === exercise.level)?.label}
      </p>
      <h1>{exercise.title}</h1>
      <h2>Situation</h2>
      <p>{exercise.situation}</p>
      <h2>Your task</h2>
      <p>{exercise.task}</p>
      <h2>What to do</h2>
      <ol>
        {exercise.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="wj-actions">
        <Link
          className="wj-btn wj-btn--accent"
          href={exercise.startHref}
          onClick={() => rememberTask(exercise.id)}
        >
          Start on the job website
        </Link>
      </div>
      <details>
        <summary>Hint</summary>
        <p>{exercise.hint}</p>
      </details>

      <form
        className="wj-panel"
        style={{ padding: 16, marginTop: 18 }}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <h2>Check</h2>
        {exercise.needsAccount && !username ? (
          <p>
            This check looks at your saved jobs or applications. <Link href={`/scenarios/jobs/account/?next=${encodeURIComponent(`/scenarios/jobs/exercises/task/?id=${exercise.id}`)}`}>Sign in</Link> first, then come back.
          </p>
        ) : null}
        {check.kind === "text" ? (
          <div className="wj-field">
            <label htmlFor="task-answer">{check.prompt}</label>
            <input id="task-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} />
            <p className="wj-help">{check.example}</p>
          </div>
        ) : null}
        {check.kind === "choice" ? (
          <fieldset>
            <legend>{check.prompt}</legend>
            {check.options.map((option) => (
              <label className="wj-check" key={option.id}>
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name="task-choice"
                  checked={selected.includes(option.id)}
                  onChange={() => {
                    setSelected((current) => {
                      if (multiple) return current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id];
                      return [option.id];
                    });
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
        ) : null}
        {check.kind === "progress" ? <p>{check.prompt}</p> : null}
        <button className="wj-btn" type="submit" disabled={busy}>
          {busy ? "Checking…" : "Check my answer"}
        </button>
        {problem ? (
          <p className="wj-error" role="alert">
            {problem}
          </p>
        ) : null}
        {result ? (
          <div className={result.correct ? "wj-ok" : "wj-warn"} role="status">
            <p>
              <strong>{result.correct ? "Correct." : "Not yet."}</strong> {result.feedback}
            </p>
          </div>
        ) : null}
      </form>
      <button type="button" className="wj-btn wj-btn--ghost" onClick={() => router.push("/scenarios/jobs/exercises/")}>
        Back to all exercises
      </button>
    </div>
  );
}
