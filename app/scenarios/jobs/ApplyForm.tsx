"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useLearner } from "../../lib/learner-session";
import { validateDraft, type ApplicationDraft, type ApplicationStep } from "../../../workers/practice-bank/src/shared/job-application";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { formatLocation } from "../../../workers/practice-bank/src/shared/jobs";
import { submitPracticeApplication } from "./jobs-api";
import { clearDraft, safeJobsPath, useJobDraft } from "./jobs-client";

const STEPS = [
  { id: "personal", label: "Personal details" },
  { id: "employment", label: "Employment history" },
  { id: "skills", label: "Skills and experience" },
  { id: "review", label: "Review" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const STEP_FOR_FIELD: Record<string, StepId> = {
  firstName: "personal",
  surname: "personal",
  email: "personal",
  telephone: "personal",
  town: "personal",
  jobTitle: "employment",
  employerName: "employment",
  dateFrom: "employment",
  dateTo: "employment",
  duties: "employment",
  skills: "skills",
  previousExperience: "skills",
  qualifications: "skills",
  statement: "skills",
};

export function ApplyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const username = useLearner();
  const job = findVacancy(params.get("id") ?? "");
  const [step, setStep] = useState<StepId>("personal");
  const [draft, writeDraft] = useJobDraft(job?.id ?? "none");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!job) {
    return (
      <div className="ps-wrap">
        <h1>Choose a job first</h1>
        <p>Open a vacancy, then select Apply for this job.</p>
        <Link className="wj-btn" href="/scenarios/jobs/search/">
          Find jobs
        </Link>
      </div>
    );
  }

  const index = STEPS.findIndex((item) => item.id === step);
  const signInHref = `/scenarios/jobs/account/?next=${encodeURIComponent(safeJobsPath(`/scenarios/jobs/apply/?id=${job.id}`) ?? "/scenarios/jobs/find/")}`;

  const update = (patch: Partial<ApplicationDraft>) => {
    writeDraft(patch);
    setErrors({});
  };

  const validateCurrent = () => {
    if (step === "review") return true;
    const found = validateDraft(draft, step as ApplicationStep);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) document.getElementById(first)?.focus();
    return Object.keys(found).length === 0;
  };

  const submit = async () => {
    const found = validateDraft(draft, "all");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = Object.keys(found)[0];
      setStep(STEP_FOR_FIELD[first] ?? "personal");
      return;
    }
    if (!username) {
      setErrors({ form: "Sign in to save this practice application. Your answers stay in this form." });
      return;
    }
    setBusy(true);
    const result = await submitPracticeApplication(username, job.id, draft);
    setBusy(false);
    if (result.ok) {
      clearDraft(job.id);
      router.push(`/scenarios/jobs/apply/done/?ref=${encodeURIComponent(result.reference)}`);
      return;
    }
    if (result.reason === "invalid" && result.errors) {
      setErrors(result.errors);
      const first = Object.keys(result.errors)[0];
      setStep(STEP_FOR_FIELD[first] ?? "review");
      return;
    }
    setErrors({ form: "The practice application could not be saved. Check your connection and try again." });
  };

  return (
    <div className="ps-wrap">
      <p>
        <Link href={`/scenarios/jobs/job/?id=${job.id}`}>← Back to the job</Link>
      </p>
      <h1>Apply for this job</h1>
      <p className="wj-lead">
        {job.title} at {job.employer}, {formatLocation(job)}. This is a practice form. It is not sent to an employer.
      </p>
      <div className="wj-note" role="note">
        <p>
          Use fictional practice details. Do not enter a National Insurance number, bank details, a password or copies of identity documents. A practice email such as sam.learner@example.com is enough.
        </p>
      </div>
      {job.suspicious ? (
        <div className="wj-warn" role="note">
          <p>
            This advert asks for something the practice form will not collect. You can still complete the application. Do not type bank details, passwords or copies of identity documents.
          </p>
        </div>
      ) : null}

      <ol className="wj-steps">
        {STEPS.map((item, itemIndex) => (
          <li key={item.id} aria-current={item.id === step ? "step" : undefined}>
            Step {itemIndex + 1}: {item.label}
          </li>
        ))}
      </ol>

      {errors.form ? (
        <p className="wj-error" role="alert">
          {errors.form} {username ? null : <Link href={signInHref}>Sign in</Link>}
        </p>
      ) : null}

      {step === "personal" ? (
        <PersonalStep draft={draft} errors={errors} update={update} />
      ) : null}
      {step === "employment" ? (
        <EmploymentStep draft={draft} errors={errors} update={update} />
      ) : null}
      {step === "skills" ? <SkillsStep draft={draft} errors={errors} update={update} /> : null}
      {step === "review" ? <ReviewStep draft={draft} onEdit={setStep} /> : null}

      <div className="wj-actions">
        {index > 0 ? (
          <button type="button" className="wj-btn wj-btn--ghost" onClick={() => setStep(STEPS[index - 1].id)}>
            Back
          </button>
        ) : null}
        {step !== "review" ? (
          <button
            type="button"
            className="wj-btn"
            onClick={() => {
              if (validateCurrent()) setStep(STEPS[index + 1].id);
            }}
          >
            Continue
          </button>
        ) : (
          <button type="button" className="wj-btn wj-btn--accent" disabled={busy} onClick={() => void submit()}>
            {busy ? "Saving practice application…" : "Submit practice application"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="wj-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? (
        <p className="wj-help" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="wj-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PersonalStep({
  draft,
  errors,
  update,
}: {
  draft: ApplicationDraft;
  errors: Record<string, string>;
  update: (patch: Partial<ApplicationDraft>) => void;
}) {
  return (
    <div>
      <h2>Personal details</h2>
      <Field id="firstName" label="First name" error={errors.firstName}>
        <input id="firstName" autoComplete="given-name" value={draft.firstName} aria-invalid={Boolean(errors.firstName)} onChange={(event) => update({ firstName: event.target.value })} />
      </Field>
      <Field id="surname" label="Surname" error={errors.surname}>
        <input id="surname" autoComplete="family-name" value={draft.surname} aria-invalid={Boolean(errors.surname)} onChange={(event) => update({ surname: event.target.value })} />
      </Field>
      <Field id="email" label="Email address" hint="Use a practice address, such as sam.learner@example.com." error={errors.email}>
        <input id="email" autoComplete="email" inputMode="email" value={draft.email} aria-invalid={Boolean(errors.email)} aria-describedby="email-hint" onChange={(event) => update({ email: event.target.value })} />
      </Field>
      <Field id="telephone" label="Telephone number" hint="A practice number such as 07700 900184 is fine." error={errors.telephone}>
        <input id="telephone" autoComplete="tel" inputMode="tel" value={draft.telephone} aria-invalid={Boolean(errors.telephone)} aria-describedby="telephone-hint" onChange={(event) => update({ telephone: event.target.value })} />
      </Field>
      <Field id="town" label="Town or postcode" error={errors.town}>
        <input id="town" value={draft.town} aria-invalid={Boolean(errors.town)} onChange={(event) => update({ town: event.target.value })} />
      </Field>
    </div>
  );
}

function EmploymentStep({
  draft,
  errors,
  update,
}: {
  draft: ApplicationDraft;
  errors: Record<string, string>;
  update: (patch: Partial<ApplicationDraft>) => void;
}) {
  return (
    <div>
      <h2>Employment history</h2>
      <label className="wj-check">
        <input
          type="checkbox"
          checked={draft.noExperience}
          onChange={(event) => update({ noExperience: event.target.checked })}
        />
        <span>I have no previous paid employment</span>
      </label>
      {draft.noExperience ? (
        <p>That is fine for this practice. You can continue to skills and experience.</p>
      ) : (
        <>
          <Field id="jobTitle" label="Previous job title" error={errors.jobTitle}>
            <input id="jobTitle" value={draft.jobTitle} aria-invalid={Boolean(errors.jobTitle)} onChange={(event) => update({ jobTitle: event.target.value })} />
          </Field>
          <Field id="employerName" label="Employer name" hint="A practice name is fine." error={errors.employerName}>
            <input id="employerName" value={draft.employerName} aria-invalid={Boolean(errors.employerName)} aria-describedby="employerName-hint" onChange={(event) => update({ employerName: event.target.value })} />
          </Field>
          <Field id="dateFrom" label="Start date" hint="For example, March 2024." error={errors.dateFrom}>
            <input id="dateFrom" value={draft.dateFrom} aria-invalid={Boolean(errors.dateFrom)} aria-describedby="dateFrom-hint" onChange={(event) => update({ dateFrom: event.target.value })} />
          </Field>
          <Field id="dateTo" label="End date" hint="For example, June 2026, or Still in this job." error={errors.dateTo}>
            <input id="dateTo" value={draft.dateTo} aria-invalid={Boolean(errors.dateTo)} aria-describedby="dateTo-hint" onChange={(event) => update({ dateTo: event.target.value })} />
          </Field>
          <Field id="duties" label="What did you do?" error={errors.duties}>
            <textarea id="duties" maxLength={500} value={draft.duties} aria-invalid={Boolean(errors.duties)} onChange={(event) => update({ duties: event.target.value })} />
          </Field>
        </>
      )}
    </div>
  );
}

function SkillsStep({
  draft,
  errors,
  update,
}: {
  draft: ApplicationDraft;
  errors: Record<string, string>;
  update: (patch: Partial<ApplicationDraft>) => void;
}) {
  return (
    <div>
      <h2>Skills and experience</h2>
      <Field id="skills" label="Relevant skills" hint="You can write None yet." error={errors.skills}>
        <textarea id="skills" maxLength={400} value={draft.skills} aria-invalid={Boolean(errors.skills)} aria-describedby="skills-hint" onChange={(event) => update({ skills: event.target.value })} />
      </Field>
      <Field id="previousExperience" label="Previous experience" hint="A few sentences, or None yet." error={errors.previousExperience}>
        <textarea id="previousExperience" maxLength={500} value={draft.previousExperience} aria-invalid={Boolean(errors.previousExperience)} aria-describedby="previousExperience-hint" onChange={(event) => update({ previousExperience: event.target.value })} />
      </Field>
      <Field id="qualifications" label="Qualifications or training" hint="Include courses, or write None yet." error={errors.qualifications}>
        <textarea id="qualifications" maxLength={300} value={draft.qualifications} aria-invalid={Boolean(errors.qualifications)} aria-describedby="qualifications-hint" onChange={(event) => update({ qualifications: event.target.value })} />
      </Field>
      <Field id="statement" label="Why you are suitable for this role" hint="Write at least a couple of sentences. Do not include private information." error={errors.statement}>
        <textarea id="statement" maxLength={800} value={draft.statement} aria-invalid={Boolean(errors.statement)} aria-describedby="statement-hint" onChange={(event) => update({ statement: event.target.value })} />
      </Field>
    </div>
  );
}

function ReviewStep({ draft, onEdit }: { draft: ApplicationDraft; onEdit: (step: StepId) => void }) {
  return (
    <div>
      <h2>Review your application</h2>
      <p>Read every answer. If something is wrong, go back and correct it before you submit.</p>
      <div className="wj-note" role="note">
        <p>Submitting saves this practice application on your account. It is not sent to an employer.</p>
      </div>
      <h3>Personal details</h3>
      <dl className="wj-facts">
        <dt>First name</dt>
        <dd>{draft.firstName}</dd>
        <dt>Surname</dt>
        <dd>{draft.surname}</dd>
        <dt>Email</dt>
        <dd>{draft.email}</dd>
        <dt>Telephone</dt>
        <dd>{draft.telephone}</dd>
        <dt>Town or postcode</dt>
        <dd>{draft.town}</dd>
      </dl>
      <button type="button" className="wj-btn wj-btn--ghost" onClick={() => onEdit("personal")}>
        Change personal details
      </button>
      <h3>Employment history</h3>
      {draft.noExperience ? (
        <p>No previous paid employment.</p>
      ) : (
        <dl className="wj-facts">
          <dt>Job title</dt>
          <dd>{draft.jobTitle}</dd>
          <dt>Employer</dt>
          <dd>{draft.employerName}</dd>
          <dt>Dates</dt>
          <dd>
            {draft.dateFrom} to {draft.dateTo}
          </dd>
          <dt>Responsibilities</dt>
          <dd>{draft.duties}</dd>
        </dl>
      )}
      <button type="button" className="wj-btn wj-btn--ghost" onClick={() => onEdit("employment")}>
        Change employment history
      </button>
      <h3>Skills and experience</h3>
      <dl className="wj-facts">
        <dt>Skills</dt>
        <dd>{draft.skills}</dd>
        <dt>Experience</dt>
        <dd>{draft.previousExperience}</dd>
        <dt>Qualifications</dt>
        <dd>{draft.qualifications}</dd>
        <dt>Supporting statement</dt>
        <dd>{draft.statement}</dd>
      </dl>
      <button type="button" className="wj-btn wj-btn--ghost" onClick={() => onEdit("skills")}>
        Change skills and experience
      </button>
    </div>
  );
}
