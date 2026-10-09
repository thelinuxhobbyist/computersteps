"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CATEGORY_LABELS,
  DIFFICULTIES,
  SKILL_LABELS,
  getLearnerSummary,
  listLearners,
  tutorStartExercise,
  tutorStopExercise,
  type Category,
  type Difficulty,
  type ExerciseListing,
  type LearnerListItem,
  type LearnerSummary,
  type TutorResult,
} from "../lib/exercise-api";
import { createUsernameStore } from "../lib/username-store";
import { getSite } from "../../workers/practice-bank/src/shared/sites";

const keyStore = createUsernameStore("computer-steps:tutor-key");
const REFRESH_MS = 10_000;

const DIFFICULTY_LABELS: Record<Difficulty, string> = { beginner: "Beginner", developing: "Developing", confident: "Confident" };

const FAILURES: Record<Exclude<TutorResult<unknown>, { ok: true }>["reason"], string> = {
  "wrong-key": "That tutor key is not right.",
  "not-set-up": "Tutor Mode has not been set up on the server yet (TUTOR_KEY is missing).",
  "not-found": "There is no learner with that username.",
  "not-available": "That exercise can't be used for this learner right now, for example because the bill has already been paid.",
  unavailable: "The server could not be reached. Check the internet connection and try again.",
};

const environmentName = (id: string) => getSite(id)?.name ?? id;
const time = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(iso));

export default function TutorMode() {
  const tutorKey = keyStore.useUsername();
  if (tutorKey === undefined) return null;
  if (!tutorKey) return <KeyForm />;
  return <Dashboard tutorKey={tutorKey} />;
}

function KeyForm() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!key.trim()) return;
    setChecking(true);
    const result = await listLearners(key.trim());
    setChecking(false);
    if (result.ok) keyStore.logIn(key.trim());
    else setError(FAILURES[result.reason]);
  };

  return (
    <main className="tm-page tm-narrow">
      <h1>Tutor Mode</h1>
      <form className="tm-panel" onSubmit={submit}>
        <label htmlFor="tm-key" className="tm-label">
          Tutor key
        </label>
        {error ? (
          <p className="tm-error" role="alert">
            {error}
          </p>
        ) : null}
        <input id="tm-key" type="password" className="tm-input" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" />
        <button type="submit" className="tm-btn tm-btn--primary" disabled={checking}>
          {checking ? "Checking…" : "Open Tutor Mode"}
        </button>
      </form>
    </main>
  );
}

function Dashboard({ tutorKey }: { tutorKey: string }) {
  const [learners, setLearners] = useState<LearnerListItem[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [environment, setEnvironment] = useState("energy");
  const [problem, setProblem] = useState("");

  const loadLearners = useCallback(async () => {
    const result = await listLearners(tutorKey);
    if (result.ok) {
      setLearners(result.value);
      setProblem("");
    } else if (result.reason === "wrong-key") keyStore.logOut();
    else setProblem(FAILURES[result.reason]);
  }, [tutorKey]);

  useEffect(() => {
    const first = window.setTimeout(loadLearners, 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadLearners();
    }, REFRESH_MS * 3);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [loadLearners]);

  const open = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (search.trim()) setSelected(search.trim());
  };

  return (
    <main className="tm-page">
      <header className="tm-header">
        <h1>Tutor Mode</h1>
        <button type="button" className="tm-link-btn" onClick={() => keyStore.logOut()}>
          Leave Tutor Mode
        </button>
      </header>

      <div className="tm-layout">
        <aside className="tm-panel tm-learners">
          <h2>Learners</h2>
          <form onSubmit={open} className="tm-search">
            <label htmlFor="tm-search" className="tm-label">
              Find by username
            </label>
            <div className="tm-row">
              <input id="tm-search" className="tm-input" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" spellCheck={false} />
              <button type="submit" className="tm-btn tm-btn--primary">
                Open
              </button>
            </div>
          </form>
          <h3>Active in the last 12 hours</h3>
          {problem ? <p className="tm-error">{problem}</p> : null}
          {learners === null ? (
            <p className="tm-muted">Loading…</p>
          ) : learners.length === 0 ? (
            <p className="tm-muted">Nobody yet. Learners appear here once they log in to Practice Bank or Westford Energy.</p>
          ) : (
            <ul className="tm-learner-list">
              {learners.map((learner) => (
                <li key={learner.username}>
                  <button type="button" className={`tm-learner ${selected?.toLowerCase() === learner.username.toLowerCase() ? "is-selected" : ""}`} onClick={() => setSelected(learner.username)}>
                    <strong>{learner.username}</strong>
                    <span>{learner.fullName}</span>
                    <span className="tm-muted">{learner.currentTitle ? `Doing: ${learner.currentTitle}` : `Last seen ${time(learner.lastUsedAt)}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="tm-main">
          {selected ? (
            <LearnerView key={selected} tutorKey={tutorKey} username={selected} environment={environment} onEnvironment={setEnvironment} onChanged={loadLearners} />
          ) : (
            <div className="tm-panel">
              <p>Choose a learner to see their progress and set an exercise.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type LearnerViewProps = {
  tutorKey: string;
  username: string;
  environment: string;
  onEnvironment: (environment: string) => void;
  onChanged: () => void;
};

function LearnerView({ tutorKey, username, environment, onEnvironment, onChanged }: LearnerViewProps) {
  const [data, setData] = useState<{ summary: LearnerSummary; environments: string[] } | null>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const result = await getLearnerSummary(tutorKey, username, environment);
    if (result.ok) {
      setData(result.value);
      setProblem("");
    } else {
      setProblem(FAILURES[result.reason]);
      if (result.reason === "wrong-key") keyStore.logOut();
    }
  }, [tutorKey, username, environment]);

  useEffect(() => {
    const first = window.setTimeout(load, 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [load]);

  const start = async (exercise?: ExerciseListing) => {
    setBusy(true);
    const result = await tutorStartExercise(tutorKey, username, environment, exercise?.id);
    setBusy(false);
    if (result.ok) {
      setMessage(`Started “${result.value.title}”. It will appear on ${username}'s screen within a few seconds.`);
      setProblem("");
      load();
      onChanged();
    } else setProblem(FAILURES[result.reason]);
  };

  const stop = async () => {
    setBusy(true);
    const result = await tutorStopExercise(tutorKey, username);
    setBusy(false);
    if (result.ok) {
      setMessage("Exercise stopped.");
      load();
      onChanged();
    } else setProblem(FAILURES[result.reason]);
  };

  if (!data) {
    return <div className="tm-panel">{problem ? <p className="tm-error">{problem}</p> : <p className="tm-muted">Loading {username}…</p>}</div>;
  }

  const { summary, environments } = data;
  return (
    <>
      <div className="tm-panel">
        <div className="tm-learner-head">
          <div>
            <h2>
              {summary.fullName} <span className="tm-muted">({summary.username})</span>
            </h2>
            <p className="tm-muted">
              {summary.addressLine1}, {summary.townOrCity}, {summary.postcode}
            </p>
          </div>
          <dl className="tm-stats">
            <div>
              <dt>Level</dt>
              <dd>{DIFFICULTY_LABELS[summary.level]}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>{summary.completedCount}</dd>
            </div>
          </dl>
        </div>
        <label className="tm-label" htmlFor="tm-environment">
          Practice website
        </label>
        <select id="tm-environment" className="tm-input tm-input--auto" value={environment} onChange={(event) => onEnvironment(event.target.value)}>
          {environments.map((id) => (
            <option key={id} value={id}>
              {environmentName(id)}
            </option>
          ))}
        </select>
      </div>

      {message ? (
        <p className="tm-message" role="status">
          {message}
        </p>
      ) : null}
      {problem ? (
        <p className="tm-error" role="alert">
          {problem}
        </p>
      ) : null}

      <div className="tm-panel">
        <h2>Current exercise</h2>
        {summary.current ? (
          <>
            <h3>{summary.current.title}</h3>
            <p className="tm-instruction">{summary.current.instruction}</p>
            <p className="tm-muted">
              {summary.current.startedBy === "tutor" ? "Set by you" : "Chosen by the learner"} · started {time(summary.current.startedAt)} · {summary.current.attempts}{" "}
              {summary.current.attempts === 1 ? "try" : "tries"}
              {summary.current.hint ? " · used the hint" : ""}
            </p>
            <button type="button" className="tm-btn tm-btn--secondary" onClick={stop} disabled={busy}>
              Stop this exercise
            </button>
          </>
        ) : (
          <p className="tm-muted">No exercise in progress.</p>
        )}
      </div>

      <div className="tm-panel tm-panel--highlight">
        <h2>Recommended next</h2>
        {summary.recommended ? (
          <>
            <ExerciseSummary exercise={summary.recommended} />
            <button type="button" className="tm-btn tm-btn--primary" onClick={() => start(summary.recommended ?? undefined)} disabled={busy}>
              Start Exercise
            </button>
          </>
        ) : (
          <p className="tm-muted">No more exercises are available for this learner.</p>
        )}
      </div>

      <ExercisePicker exercises={summary.exercises} busy={busy} onStart={start} />

      <div className="tm-two">
        <div className="tm-panel">
          <h2>Recent progress</h2>
          {summary.recent.length === 0 ? (
            <p className="tm-muted">No exercises yet.</p>
          ) : (
            <table className="tm-table">
              <thead>
                <tr>
                  <th scope="col">Exercise</th>
                  <th scope="col">Result</th>
                  <th scope="col">Tries</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent.map((item) => (
                  <tr key={item.attemptId}>
                    <td>
                      {item.title}
                      <span className="tm-muted tm-block">
                        {DIFFICULTY_LABELS[item.difficulty]} · {time(item.startedAt)}
                      </span>
                    </td>
                    <td>
                      {item.status === "active" ? "In progress" : item.success ? "✓ Done" : "Skipped"}
                      {item.helpUsed ? <span className="tm-muted tm-block">used hint</span> : null}
                    </td>
                    <td>{item.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="tm-panel">
          <h2>Skills</h2>
          {summary.skills.length === 0 ? (
            <p className="tm-muted">No skills practised yet.</p>
          ) : (
            <table className="tm-table">
              <thead>
                <tr>
                  <th scope="col">Skill</th>
                  <th scope="col">Done / tried</th>
                </tr>
              </thead>
              <tbody>
                {summary.skills.map((skill) => (
                  <tr key={skill.skill}>
                    <td>{SKILL_LABELS[skill.skill]}</td>
                    <td>
                      {skill.succeeded} / {skill.tried}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function ExerciseSummary({ exercise }: { exercise: ExerciseListing }) {
  return (
    <div className="tm-exercise">
      <h3>{exercise.title}</h3>
      <p className="tm-instruction">{exercise.instruction}</p>
      <p className="tm-tags">
        <span className={`tm-tag tm-tag--${exercise.difficulty}`}>{DIFFICULTY_LABELS[exercise.difficulty]}</span>
        <span className="tm-tag">{CATEGORY_LABELS[exercise.category]}</span>
        {exercise.sites.length > 1 ? <span className="tm-tag">Uses {exercise.sites.map(environmentName).join(" + ")}</span> : null}
        {exercise.skills.map((skill) => (
          <span key={skill} className="tm-tag tm-tag--skill">
            {SKILL_LABELS[skill]}
          </span>
        ))}
      </p>
    </div>
  );
}

function ExercisePicker({ exercises, busy, onStart }: { exercises: ExerciseListing[]; busy: boolean; onStart: (exercise: ExerciseListing) => void }) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const shown = exercises.filter((exercise) => (category === "all" || exercise.category === category) && (difficulty === "all" || exercise.difficulty === difficulty));

  return (
    <details className="tm-panel tm-picker">
      <summary>
        <h2>Choose a specific exercise ({exercises.length})</h2>
      </summary>
      <div className="tm-row tm-filters">
        <label>
          <span className="tm-label">Type</span>
          <select className="tm-input tm-input--auto" value={category} onChange={(event) => setCategory(event.target.value as Category | "all")}>
            <option value="all">All types</option>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((id) => (
              <option key={id} value={id}>
                {CATEGORY_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="tm-label">Difficulty</span>
          <select className="tm-input tm-input--auto" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | "all")}>
            <option value="all">All levels</option>
            {DIFFICULTIES.map((id) => (
              <option key={id} value={id}>
                {DIFFICULTY_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="tm-exercise-list">
        {shown.map((exercise) => (
          <li key={exercise.id} className={exercise.available ? "" : "is-unavailable"}>
            <ExerciseSummary exercise={exercise} />
            <div className="tm-exercise-actions">
              <span className="tm-muted">
                {exercise.timesDone === 0 ? "Not tried yet" : `Done ${exercise.timesDone}× · last time ${exercise.lastSuccess ? "✓" : "skipped"}`}
                {exercise.available ? "" : " · not available right now"}
              </span>
              <button type="button" className="tm-btn tm-btn--secondary" onClick={() => onStart(exercise)} disabled={busy || !exercise.available}>
                Start
              </button>
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
