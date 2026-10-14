"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faClipboardCheck, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { answerTask, checkTask, getCurrentTask, showHint, skipTask, startNextTask, type LearnerTask } from "../lib/exercise-api";
import { useLearner } from "../lib/learner-session";
import { DATA_CHANGED_EVENT } from "../scenarios/practice-bank/bank-api";
import { useBankUsername } from "../scenarios/practice-bank/bank-session";
import { useEnergyUsername } from "../scenarios/energy/energy-session";
import { SITES, pageIdFor } from "../../workers/practice-bank/src/shared/sites";
import "./task-panel.css";

/** Websites that have their own practice tasks. Tasks can still lead to the other websites. */
const TASK_ENVIRONMENTS = ["energy"];
const POLL_MS = 10_000;
const SKIP_AFTER_ATTEMPTS = 2;

type Feedback = { correct: boolean; text: string };

/** The practice task, shown on every ComputerSteps practice website so a task can span several of them. */
export default function TaskPanel() {
  const pathname = usePathname();
  const pageId = pageIdFor(pathname);
  const learner = useLearner();
  const energyUser = useEnergyUsername();
  const bankUser = useBankUsername();
  const username = learner ?? energyUser ?? bankUser ?? null;

  if (!pageId || !username) return null;
  return <Panel key={username} username={username} pageId={pageId} />;
}

function Panel({ username, pageId }: { username: string; pageId: string }) {
  const [task, setTask] = useState<LearnerTask | null | undefined>(undefined);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [open, setOpen] = useState(true);
  const [noneLeft, setNoneLeft] = useState(false);
  const taskRef = useRef<LearnerTask | null | undefined>(undefined);
  const busyRef = useRef(false);
  const site = pageId.split(".")[0];
  const environment = task?.environment ?? (TASK_ENVIRONMENTS.includes(site) ? site : null);

  const applyTask = useCallback((next: LearnerTask | null) => {
    const previous = taskRef.current;
    taskRef.current = next;
    setTask(next);
    if (next?.attemptId !== previous?.attemptId) {
      setFeedback(next?.status === "completed" ? { correct: true, text: "✓ That's right." } : null);
      setText("");
      setChosen([]);
      setProblem("");
      if (next && next.status === "active") setOpen(true);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (busyRef.current) return;
    const current = await getCurrentTask(username);
    if (current !== undefined && !busyRef.current) applyTask(current);
  }, [username, applyTask]);

  useEffect(() => {
    // Polling picks up tasks a tutor starts from another device.
    const first = window.setTimeout(refresh, 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const run = async <T,>(action: () => Promise<T>): Promise<T> => {
    busyRef.current = true;
    setBusy(true);
    try {
      return await action();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const handleResult = (result: Awaited<ReturnType<typeof answerTask>>, quietIfWrong = false) => {
    if (result === undefined) {
      if (!quietIfWrong) setProblem("We couldn't check your answer. Check you are connected to the internet, then try again.");
      return;
    }
    if (result === null) {
      applyTask(null);
      return;
    }
    setProblem("");
    taskRef.current = result.task;
    setTask(result.task);
    if (result.correct || !quietIfWrong) setFeedback({ correct: result.correct, text: result.feedback });
  };

  const autoCheck = useCallback(
    async (page: string) => {
      const current = taskRef.current;
      if (!current || current.status !== "active" || busyRef.current) return;
      if (current.answerType !== "navigation" && current.answerType !== "action") return;
      busyRef.current = true;
      const result = await checkTask(username, page, true);
      busyRef.current = false;
      if (result && result.correct) {
        taskRef.current = result.task;
        setTask(result.task);
        setFeedback({ correct: true, text: result.feedback });
        setOpen(true);
      }
    },
    [username],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => autoCheck(pageId), 0);
    return () => window.clearTimeout(timer);
  }, [pageId, task?.attemptId, autoCheck]);

  useEffect(() => {
    const onChange = () => autoCheck(pageId);
    window.addEventListener(DATA_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, onChange);
  }, [pageId, autoCheck]);

  const submit = async (event?: FormEvent<HTMLFormElement>, answer?: string | string[]) => {
    event?.preventDefault();
    if (!task || busy) return;
    if (task.answerType === "action" || task.answerType === "navigation") {
      handleResult(await run(() => checkTask(username, pageId, false)));
      return;
    }
    const given = answer ?? (task.answerType === "choice" ? chosen : text);
    if (given.length === 0 || (typeof given === "string" && !given.trim())) {
      setFeedback({ correct: false, text: task.answerType === "choice" ? "Choose an answer first." : "Type your answer first." });
      return;
    }
    handleResult(await run(() => answerTask(username, given)));
  };

  const next = async () => {
    if (!environment) return;
    const result = await run(() => startNextTask(username, environment));
    if (result.ok) {
      setNoneLeft(false);
      applyTask(result.task);
    } else if (result.reason === "none-left") {
      setNoneLeft(true);
      applyTask(null);
    } else {
      setProblem("We couldn't load a task. Check you are connected to the internet, then try again.");
    }
  };

  const hint = async () => {
    const result = await run(() => showHint(username));
    if (result) {
      taskRef.current = result;
      setTask(result);
    } else if (result === null) applyTask(null);
  };

  const skip = async () => {
    if (await run(() => skipTask(username))) applyTask(null);
  };

  if (task === undefined) return null;
  if (!task && !environment) return null;
  if (task && task.environment !== pageId.split(".")[0]) return null;

  if (!open) {
    return (
      <button type="button" className="tp-pill" onClick={() => setOpen(true)} aria-expanded="false" aria-controls="tp-panel">
        <FontAwesomeIcon icon={faClipboardCheck} aria-hidden="true" />
        {task?.status === "active" ? "Your task" : "Practice task"}
      </button>
    );
  }

  return (
    <aside id="tp-panel" className="tp-panel" aria-labelledby="tp-heading">
      <div className="tp-panel__head">
        <h2 id="tp-heading">
          <FontAwesomeIcon icon={faClipboardCheck} aria-hidden="true" /> {task ? "Your task" : "Practice task"}
        </h2>
        <button type="button" className="tp-icon-btn" onClick={() => setOpen(false)} aria-expanded="true" aria-controls="tp-panel">
          <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
          <span className="tp-visually-hidden">Hide task</span>
        </button>
      </div>

      <div className="tp-panel__body">
        {!task ? (
          noneLeft ? (
            <p>You have done every task for this website. Well done!</p>
          ) : (
            <>
              <p>Would you like a task to practise with this website?</p>
              <button type="button" className="tp-btn tp-btn--primary" onClick={next} disabled={busy}>
                {busy ? "Loading…" : "Start a practice task"}
              </button>
            </>
          )
        ) : (
          <TaskBody
            task={task}
            pageId={pageId}
            feedback={feedback}
            text={text}
            chosen={chosen}
            busy={busy}
            onText={(value) => {
              setText(value);
              if (feedback && !feedback.correct) setFeedback(null);
            }}
            onChosen={(value) => {
              setChosen(value);
              if (feedback && !feedback.correct) setFeedback(null);
            }}
            onSubmit={submit}
            onHint={hint}
            onSkip={skip}
            onNext={next}
          />
        )}
        {problem ? (
          <p className="tp-problem" role="alert">
            {problem}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

type TaskBodyProps = {
  task: LearnerTask;
  pageId: string;
  feedback: Feedback | null;
  text: string;
  chosen: string[];
  busy: boolean;
  onText: (value: string) => void;
  onChosen: (value: string[]) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>, answer?: string | string[]) => void;
  onHint: () => void;
  onSkip: () => void;
  onNext: () => void;
};

function TaskBody({ task, pageId, feedback, text, chosen, busy, onText, onChosen, onSubmit, onHint, onSkip, onNext }: TaskBodyProps) {
  const done = task.status === "completed";
  const siteLinks = task.sites.flatMap((site) => {
    const info = SITES.find((item) => item.id === site.id);
    return info && !pageId.startsWith(`${site.id}.`) ? [{ ...site, href: info.href }] : [];
  });

  return (
    <>
      {task.startedBy === "tutor" ? <p className="tp-label">Set by your tutor</p> : null}
      <div className="tp-instruction">
        {task.instruction.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {!done && siteLinks.length > 0 ? (
        <p className="tp-sites">
          You will need:{" "}
          {siteLinks.map((site, index) => (
            <span key={site.id}>
              {index > 0 ? ", " : ""}
              <Link href={site.href}>{site.name}</Link>
            </span>
          ))}
        </p>
      ) : null}

      {done ? null : <AnswerInput task={task} text={text} chosen={chosen} busy={busy} onText={onText} onChosen={onChosen} onSubmit={onSubmit} />}

      {feedback ? (
        <p className={`tp-feedback ${feedback.correct ? "is-correct" : "is-wrong"}`} role="status">
          {feedback.text}
        </p>
      ) : null}

      {done ? (
        <button type="button" className="tp-btn tp-btn--primary" onClick={onNext} disabled={busy}>
          {busy ? "Loading…" : "Next task →"}
        </button>
      ) : (
        <div className="tp-help">
          {task.hint ? (
            <p className="tp-hint">
              <FontAwesomeIcon icon={faLightbulb} aria-hidden="true" /> {task.hint}
            </p>
          ) : (
            <button type="button" className="tp-text-btn" onClick={onHint} disabled={busy}>
              <FontAwesomeIcon icon={faLightbulb} aria-hidden="true" /> Show a hint
            </button>
          )}
          {task.attempts >= SKIP_AFTER_ATTEMPTS || task.hint ? (
            <button type="button" className="tp-text-btn" onClick={onSkip} disabled={busy}>
              Skip this task
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}

type AnswerInputProps = Pick<TaskBodyProps, "task" | "text" | "chosen" | "busy" | "onText" | "onChosen" | "onSubmit">;

function AnswerInput({ task, text, chosen, busy, onText, onChosen, onSubmit }: AnswerInputProps) {
  const question = task.question ? <p className="tp-question">{task.question}</p> : null;

  if (task.answerType === "navigation") {
    return <p className="tp-small">When you find the right page, this task will notice.</p>;
  }

  if (task.answerType === "action") {
    return (
      <div className="tp-answer">
        <p className="tp-small">When you have done it, this task will notice.</p>
        <button type="button" className="tp-btn tp-btn--secondary" onClick={() => onSubmit()} disabled={busy}>
          {busy ? "Checking…" : "I've done it"}
        </button>
      </div>
    );
  }

  if (task.answerType === "yes_no") {
    return (
      <div className="tp-answer">
        {question}
        <div className="tp-yes-no">
          <button type="button" className="tp-btn tp-btn--secondary" onClick={() => onSubmit(undefined, "yes")} disabled={busy}>
            Yes
          </button>
          <button type="button" className="tp-btn tp-btn--secondary" onClick={() => onSubmit(undefined, "no")} disabled={busy}>
            No
          </button>
        </div>
      </div>
    );
  }

  if (task.answerType === "choice" && task.options) {
    const toggle = (id: string) => {
      if (!task.multiple) onChosen([id]);
      else onChosen(chosen.includes(id) ? chosen.filter((item) => item !== id) : [...chosen, id]);
    };
    return (
      <form className="tp-answer" onSubmit={onSubmit}>
        <fieldset className="tp-options">
          <legend>{task.question ?? (task.multiple ? "Choose all that apply." : "Choose one answer.")}</legend>
          {task.multiple && task.question ? <p className="tp-small">Choose all that apply.</p> : null}
          {task.options.map((option) => (
            <label key={option.id} className="tp-option">
              <input
                type={task.multiple ? "checkbox" : "radio"}
                name={`tp-option-${task.attemptId}`}
                checked={chosen.includes(option.id)}
                onChange={() => toggle(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="tp-btn tp-btn--primary" disabled={busy}>
          {busy ? "Checking…" : "Check my answer"}
        </button>
      </form>
    );
  }

  const inputId = `tp-answer-${task.attemptId}`;
  return (
    <form className="tp-answer" onSubmit={onSubmit}>
      <label htmlFor={inputId} className="tp-question">
        {task.question ?? "Your answer"}
      </label>
      <div className="tp-input-row">
        {task.unit?.before ? <span aria-hidden="true">{task.unit.before}</span> : null}
        <input
          id={inputId}
          className="tp-input"
          value={text}
          onChange={(event) => onText(event.target.value)}
          inputMode={task.answerType === "number" ? "decimal" : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={task.answerType === "date" ? "For example: 3 March 2026" : undefined}
        />
        {task.unit?.after ? <span>{task.unit.after}</span> : null}
      </div>
      <button type="submit" className="tp-btn tp-btn--primary" disabled={busy}>
        {busy ? "Checking…" : "Check my answer"}
      </button>
    </form>
  );
}
