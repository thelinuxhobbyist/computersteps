"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { useLearner } from "../../lib/learner-session";
import { getAccount } from "../practice-bank/bank-api";
import { applicationFromProfile, cvContent, syncCvFields, validateDraft, type ApplicationDraft, type CvJob } from "../../../workers/practice-bank/src/shared/job-application";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { HOURS_LABELS, formatLocation, type Vacancy } from "../../../workers/practice-bank/src/shared/jobs";
import {
  SAMPLE_CV_FILE_NAME,
  cvFileError,
  practiceProfileFromIdentity,
  type PracticeProfile,
} from "../../../workers/practice-bank/src/shared/practice-profile";
import { SampleCv } from "./SampleCv";
import { submitPracticeApplication } from "./jobs-api";
import { clearDraft, readSavedCv, safeJobsPath, useJobDraft, writeSavedCv } from "./jobs-client";

const STEPS = [
  { id: "cv", label: "Your CV" },
  { id: "review", label: "Review and apply" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const MAX_CV_BYTES = 5 * 1024 * 1024;

const STEP_FOR_FIELD: Record<string, StepId> = {
  cvChoice: "cv",
  cvFileName: "cv",
  firstName: "review",
  surname: "review",
  email: "review",
  telephone: "review",
  town: "review",
  postcode: "review",
};

export function ApplyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const username = useLearner();
  const job = findVacancy(params.get("id") ?? "");
  const [step, setStep] = useState<StepId>("cv");
  const [draft, writeDraft] = useJobDraft(job?.id ?? "none");
  const [profile, setProfile] = useState<PracticeProfile | null>(null);
  const [profileState, setProfileState] = useState<"loading" | "ready" | "missing">("loading");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileNote, setFileNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [editingCv, setEditingCv] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chosenFile, setChosenFile] = useState<File | null>(null);
  const filledFor = useRef("");
  const draftRef = useRef(draft);
  const fileRef = useRef<HTMLInputElement>(null);
  draftRef.current = draft;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getAccount(username).then((result) => {
      if (cancelled) return;
      if (result.status !== "ready") {
        setProfileState("missing");
        return;
      }
      setProfile(
        practiceProfileFromIdentity({
          fullName: result.account.fullName,
          addressLine1: result.account.addressLine1,
          townOrCity: result.account.townOrCity,
          postcode: result.account.postcode,
        }),
      );
      setProfileState("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    if (!profile || !username || !job || filledFor.current === job.id) return;
    filledFor.current = job.id;
    const current = draftRef.current;
    const saved = readSavedCv(username);
    const stored = applicationFromProfile(profile, saved.choice === "upload" ? "upload" : "sample", saved.fileName);
    const keepContact = Boolean(current.firstName);
    writeDraft({
      ...stored,
      ...(keepContact
        ? {
            firstName: current.firstName,
            surname: current.surname,
            email: current.email,
            telephone: current.telephone,
            addressLine: current.addressLine,
            town: current.town,
            postcode: current.postcode,
          }
        : {}),
      cvChoice: current.cvChoice || stored.cvChoice,
      cvFileName: current.cvFileName || stored.cvFileName,
    });
  }, [profile, username, job, writeDraft]);

  if (!job) {
    return (
      <div className="ps-wrap">
        <h1>Choose a job first</h1>
        <p>Open a job, then select Apply now.</p>
        <Link className="wj-btn" href="/scenarios/jobs/search/">
          Find jobs
        </Link>
      </div>
    );
  }

  const signInHref = `/scenarios/jobs/account/?next=${encodeURIComponent(safeJobsPath(`/scenarios/jobs/apply/?id=${job.id}`) ?? "/scenarios/jobs/find/")}`;
  const index = STEPS.findIndex((item) => item.id === step);

  const update = (patch: Partial<ApplicationDraft>) => {
    writeDraft(patch);
    setErrors({});
    setFileNote("");
  };

  const rememberCv = (choice: "sample" | "upload", fileName: string) => {
    if (choice === "sample") setChosenFile(null);
    if (username) writeSavedCv(username, choice, fileName);
    update({ cvChoice: choice, cvFileName: fileName });
  };

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_CV_BYTES) {
      setFileNote("That file is larger than 5 MB. Choose a smaller CV.");
      return;
    }
    const problem = cvFileError(file.name);
    if (problem) {
      setFileNote(problem);
      return;
    }
    setChosenFile(file);
    rememberCv("upload", file.name);
  };

  const validateCurrent = () => {
    if (step === "review") return true;
    const found = validateDraft(draft, "documents");
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const submit = async () => {
    const ready = syncCvFields(draft);
    writeDraft(ready);
    const found = validateDraft(ready, "all");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = Object.keys(found)[0];
      const next = STEP_FOR_FIELD[first] ?? "review";
      setStep(next);
      if (next === "review") {
        const contact = ["firstName", "surname", "email", "telephone", "addressLine", "town", "postcode"];
        if (Object.keys(found).some((key) => contact.includes(key))) setEditing(true);
        if (Object.keys(found).some((key) => !contact.includes(key) && key !== "form")) setEditingCv(true);
      }
      return;
    }
    if (!username) {
      setErrors({ form: "Sign in to submit this application. Your saved details stay on your account." });
      return;
    }
    setBusy(true);
    const result = await submitPracticeApplication(username, job.id, ready);
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
    setErrors({ form: "The application could not be submitted. Check your connection and try again." });
  };

  const replaceCv = () => {
    if (fileRef.current) fileRef.current.value = "";
    fileRef.current?.click();
  };

  return (
    <ApplyPage job={job} step={username && profile ? step : "cv"}>
      {job.suspicious ? (
        <div className="wj-warn" role="note">
          <p>
            This advert asks for something this application will not collect. You can still apply. Do not type bank details, passwords or copies of identity documents.
          </p>
        </div>
      ) : null}

      {username === undefined ? <p>Loading your saved details…</p> : null}
      {username === null ? (
        <div className="wj-apply__card wj-apply__pad">
          <h2>Sign in</h2>
          <p>Sign in to use the details saved on your account.</p>
          <ScenarioSignIn />
        </div>
      ) : null}
      {username && profileState === "loading" ? <p>Loading your saved details…</p> : null}
      {username && profileState === "missing" ? (
        <p className="wj-error" role="alert">
          Your saved details could not be loaded. Check your connection and try again.
        </p>
      ) : null}

      {username && profile ? (
        <>
          {errors.form ? (
            <p className="wj-error" role="alert">
              {errors.form} {username ? null : <Link href={signInHref}>Sign in</Link>}
            </p>
          ) : null}

          {step === "cv" ? (
            <CvStep
              draft={draft}
              profile={profile}
              chosenFile={chosenFile}
              errors={errors}
              fileNote={fileNote}
              onSample={() => rememberCv("sample", SAMPLE_CV_FILE_NAME)}
              onRemove={() => {
                if (fileRef.current) fileRef.current.value = "";
                setChosenFile(null);
                update({ cvChoice: "", cvFileName: "" });
              }}
              onReplace={replaceCv}
            />
          ) : null}
          {step === "review" ? (
            <ReviewStep
              draft={draft}
              profile={profile}
              chosenFile={chosenFile}
              editing={editing}
              editingCv={editingCv}
              errors={errors}
              update={update}
              onEdit={() => setEditing(true)}
              onEditCv={() => setEditingCv(true)}
              onReplace={replaceCv}
            />
          ) : null}

          <p className="wj-apply__consent">
            {step === "review"
              ? "Check everything above. You can change your contact details before you apply. Your CV file is not kept after you apply."
              : "The sample CV is already on your account. You can keep it, or upload a different file."}
          </p>
          <div className="wj-apply__actions">
            {index > 0 ? (
              <button type="button" className="wj-btn wj-btn--ghost" onClick={() => setStep(STEPS[index - 1].id)}>
                Back
              </button>
            ) : (
              <Link className="wj-btn wj-btn--ghost" href={`/scenarios/jobs/job/?id=${job.id}`}>
                Back
              </Link>
            )}
            {step !== "review" ? (
              <button
                type="button"
                className="wj-btn"
                onClick={() => {
                  if (validateCurrent()) setStep("review");
                }}
              >
                Review and apply
              </button>
            ) : (
              <button type="button" className="wj-btn" disabled={busy} onClick={() => void submit()}>
                {busy ? "Submitting application…" : "Submit application"}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            id="cvFile"
            className="wj-cv-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,text/plain"
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
        </>
      ) : null}
    </ApplyPage>
  );
}

function employerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WJ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function fileKind(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
  if (ext === "DOCX") return "DOC";
  return ext.slice(0, 4);
}

function ApplyPage({ job, step, children }: { job: Vacancy; step: StepId; children: ReactNode }) {
  const index = STEPS.findIndex((item) => item.id === step);
  return (
    <div className="wj-apply">
      <p className="wj-apply__crumbs">
        <Link href="/scenarios/jobs/find/">Find jobs</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/scenarios/jobs/job/?id=${job.id}`}>{job.title}</Link>
        <span aria-hidden="true">/</span>
        Apply
      </p>
      <h1>Apply for {job.title}</h1>
      <p className="wj-apply__sub">
        {job.employer}, {formatLocation(job)}
      </p>
      <p className="wj-apply__practice">Practice site. Your application is not sent to a real employer.</p>

      <ol className="wj-apply__steps" aria-label="Application progress">
        {STEPS.map((item, itemIndex) => {
          const done = itemIndex < index;
          const now = item.id === step;
          return (
            <li key={item.id} className={done ? "is-done" : now ? "is-now" : undefined} aria-current={now ? "step" : undefined}>
              <span className="wj-apply__dot" aria-hidden="true">
                {done ? "✓" : itemIndex + 1}
              </span>
              <span className="wj-apply__step-label">
                {done ? <span className="wj-visually-hidden">Completed: </span> : null}
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="wj-apply__grid">
        <section>{children}</section>
        <aside>
          <div className="wj-apply__card wj-apply__job">
            <div className="wj-apply__co">
              <div className="wj-apply__logo" aria-hidden="true">
                {employerInitials(job.employer)}
              </div>
              <div>
                <h2>{job.title}</h2>
                <p>{job.employer}</p>
              </div>
            </div>
            <ul className="wj-apply__facts">
              <li>
                <span>Location</span>
                {formatLocation(job)}
              </li>
              <li>
                <span>Job type</span>
                {HOURS_LABELS[job.hours]}
              </li>
              <li>
                <span>Pay</span>
                {job.payLabel}
              </li>
            </ul>
          </div>
          <div className="wj-apply__card wj-apply__next">
            <h2>What happens next</h2>
            <ol>
              <li>You submit your application.</li>
              <li>The employer reads it.</li>
              <li>If they like it, they contact you by email or phone.</li>
            </ol>
          </div>
          <p className="wj-apply__tip">
            <strong>Tip:</strong> make sure your phone number is right. Employers often ring first.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="wj-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="wj-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CvStep({
  draft,
  profile,
  chosenFile,
  errors,
  fileNote,
  onSample,
  onRemove,
  onReplace,
}: {
  draft: ApplicationDraft;
  profile: PracticeProfile;
  chosenFile: File | null;
  errors: Record<string, string>;
  fileNote: string;
  onSample: () => void;
  onRemove: () => void;
  onReplace: () => void;
}) {
  const attached = draft.cvChoice === "sample" || (draft.cvChoice === "upload" && Boolean(draft.cvFileName));
  const fileName = draft.cvChoice === "sample" ? SAMPLE_CV_FILE_NAME : draft.cvFileName;

  return (
    <div className="wj-apply__card">
      <div className="wj-apply__head">
        <h2>Your CV</h2>
      </div>
      {attached ? (
        <CvFile
          fileName={fileName}
          note={draft.cvChoice === "sample" ? "Saved on your account" : "Chosen on this device"}
          draft={draft}
          profile={profile}
          chosenFile={chosenFile}
          onReplace={onReplace}
        />
      ) : (
        <p className="wj-apply__empty">No CV is attached yet.</p>
      )}
      <div className="wj-warn" role="note">
        <p>Do not upload a real CV unless you are comfortable doing so. A practice CV is enough. Westford Jobs keeps the file name only. The document is not stored and is not sent to an employer.</p>
      </div>
      {errors.cvChoice || errors.cvFileName || fileNote ? (
        <p className="wj-error" role="alert">
          {errors.cvFileName || errors.cvChoice || fileNote}
        </p>
      ) : null}
      <div className="wj-apply__extra">
        {draft.cvChoice !== "sample" ? (
          <button type="button" className="wj-apply__text" onClick={onSample}>
            Use the sample CV
          </button>
        ) : null}
        {attached ? (
          <button type="button" className="wj-apply__text" onClick={onRemove}>
            Remove attachment
          </button>
        ) : null}
        {attached ? null : (
          <button type="button" className="wj-apply__text" onClick={onReplace}>
            Upload a CV
          </button>
        )}
      </div>
    </div>
  );
}

function dateEnded(dateTo: string): string {
  return dateTo === "Still in this job" ? "present" : dateTo;
}

function filledLines(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

function LineList({ items }: { items: string[] }) {
  const lines = filledLines(items);
  if (lines.length === 0) return "Not added yet";
  if (lines.length === 1) return lines[0];
  return (
    <ul className="wj-cv-lines">
      {lines.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function CvSummary({ draft }: { draft: ApplicationDraft }) {
  const content = cvContent(draft);
  return (
    <dl className="wj-apply__rows">
      <div className="wj-apply__row">
        <dt>Recent job</dt>
        <dd>
          {content.jobs.length === 0 ? (
            "No previous paid employment"
          ) : (
            <ul className="wj-cv-lines">
              {content.jobs.map((job, index) => (
                <li key={`${index}-${job.jobTitle}`}>
                  {job.jobTitle} at {job.employerName}, {job.dateFrom} to {dateEnded(job.dateTo)}
                </li>
              ))}
            </ul>
          )}
        </dd>
      </div>
      <div className="wj-apply__row">
        <dt>What you did</dt>
        <dd>
          <LineList items={content.dutyItems} />
        </dd>
      </div>
      <div className="wj-apply__row">
        <dt>Skills</dt>
        <dd>
          <LineList items={content.skillItems} />
        </dd>
      </div>
      <div className="wj-apply__row">
        <dt>Qualifications</dt>
        <dd>
          <LineList items={content.qualificationItems} />
        </dd>
      </div>
    </dl>
  );
}

const MAX_JOBS = 6;
const MAX_LINES = 8;

function CvEditor({
  draft,
  errors,
  update,
}: {
  draft: ApplicationDraft;
  errors: Record<string, string>;
  update: (patch: Partial<ApplicationDraft>) => void;
}) {
  const content = cvContent(draft);
  const jobs = draft.jobs.length ? draft.jobs : content.jobs.length ? content.jobs : [{ jobTitle: "", employerName: "", dateFrom: "", dateTo: "" }];
  const dutyItems = draft.dutyItems.length ? draft.dutyItems : content.dutyItems.length ? content.dutyItems : [""];
  const skillItems = draft.skillItems.length ? draft.skillItems : content.skillItems.length ? content.skillItems : [""];
  const qualificationItems = draft.qualificationItems.length ? draft.qualificationItems : content.qualificationItems.length ? content.qualificationItems : [""];

  const save = (patch: Partial<ApplicationDraft>) => {
    update(syncCvFields({ ...draft, jobs, dutyItems, skillItems, qualificationItems, ...patch }));
  };

  const changeJob = (index: number, patch: Partial<CvJob>) => {
    save({ jobs: jobs.map((job, jobIndex) => (jobIndex === index ? { ...job, ...patch } : job)) });
  };

  return (
    <div className="wj-apply__editor">
      {jobs.map((job, index) => {
        const suffix = index === 0 ? "" : `-${index}`;
        return (
          <div className="wj-apply__repeat" key={`job-${index}`}>
            <div className="wj-apply__repeat-head">
              <h3>{jobs.length > 1 ? `Recent job ${index + 1}` : "Recent job"}</h3>
              {jobs.length > 1 ? (
                <button type="button" className="wj-apply__text" onClick={() => save({ jobs: jobs.filter((_, jobIndex) => jobIndex !== index) })}>
                  Remove
                </button>
              ) : null}
            </div>
            <Field id={`jobTitle${suffix}`} label="Job title" error={errors[`jobTitle${suffix}`]}>
              <input id={`jobTitle${suffix}`} value={job.jobTitle} aria-invalid={Boolean(errors[`jobTitle${suffix}`])} onChange={(event) => changeJob(index, { jobTitle: event.target.value })} />
            </Field>
            <Field id={`employerName${suffix}`} label="Employer" error={errors[`employerName${suffix}`]}>
              <input id={`employerName${suffix}`} value={job.employerName} aria-invalid={Boolean(errors[`employerName${suffix}`])} onChange={(event) => changeJob(index, { employerName: event.target.value })} />
            </Field>
            <Field id={`dateFrom${suffix}`} label="Date started" error={errors[`dateFrom${suffix}`]}>
              <input id={`dateFrom${suffix}`} value={job.dateFrom} aria-invalid={Boolean(errors[`dateFrom${suffix}`])} onChange={(event) => changeJob(index, { dateFrom: event.target.value })} />
            </Field>
            <Field id={`dateTo${suffix}`} label="Date ended" error={errors[`dateTo${suffix}`]}>
              <input id={`dateTo${suffix}`} value={job.dateTo} aria-invalid={Boolean(errors[`dateTo${suffix}`])} onChange={(event) => changeJob(index, { dateTo: event.target.value })} />
            </Field>
          </div>
        );
      })}
      {jobs.length < MAX_JOBS ? (
        <button type="button" className="wj-apply__text wj-apply__add" onClick={() => save({ jobs: [...jobs, { jobTitle: "", employerName: "", dateFrom: "", dateTo: "" }] })}>
          Add another job
        </button>
      ) : null}

      <LineEditor
        title="What you did"
        addLabel="Add another thing you did"
        items={dutyItems}
        error={errors.duties}
        onChange={(next) => save({ dutyItems: next })}
      />
      <LineEditor
        title="Skills"
        addLabel="Add another skill"
        items={skillItems}
        error={errors.skills}
        onChange={(next) => save({ skillItems: next })}
      />
      <LineEditor
        title="Qualifications"
        addLabel="Add another qualification"
        items={qualificationItems}
        error={errors.qualifications}
        onChange={(next) => save({ qualificationItems: next })}
      />
    </div>
  );
}

function LineEditor({
  title,
  addLabel,
  items,
  error,
  onChange,
}: {
  title: string;
  addLabel: string;
  items: string[];
  error?: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="wj-apply__repeat">
      <h3>{title}</h3>
      {items.map((item, index) => (
        <div className="wj-apply__line" key={`${title}-${index}`}>
          <Field id={`${title.replace(/\s+/g, "-").toLowerCase()}-${index}`} label={items.length > 1 ? `${title} ${index + 1}` : title} error={index === 0 ? error : undefined}>
            <input
              id={`${title.replace(/\s+/g, "-").toLowerCase()}-${index}`}
              value={item}
              aria-invalid={index === 0 && Boolean(error)}
              onChange={(event) => onChange(items.map((current, itemIndex) => (itemIndex === index ? event.target.value : current)))}
            />
          </Field>
          {items.length > 1 ? (
            <button type="button" className="wj-apply__text" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {items.length < MAX_LINES ? (
        <button type="button" className="wj-apply__text wj-apply__add" onClick={() => onChange([...items, ""])}>
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}

function ReviewStep({
  draft,
  profile,
  chosenFile,
  editing,
  editingCv,
  errors,
  update,
  onEdit,
  onEditCv,
  onReplace,
}: {
  draft: ApplicationDraft;
  profile: PracticeProfile;
  chosenFile: File | null;
  editing: boolean;
  editingCv: boolean;
  errors: Record<string, string>;
  update: (patch: Partial<ApplicationDraft>) => void;
  onEdit: () => void;
  onEditCv: () => void;
  onReplace: () => void;
}) {
  const address = [draft.addressLine, draft.town, draft.postcode].filter(Boolean).join(", ");
  const fileName = draft.cvChoice === "sample" ? SAMPLE_CV_FILE_NAME : draft.cvFileName;
  return (
    <div className="wj-apply__review">
      <div className="wj-apply__card">
        <div className="wj-apply__head">
          <h2>Your CV</h2>
        </div>
        {fileName ? (
          <CvFile
            fileName={fileName}
            note={draft.cvChoice === "sample" ? "Saved on your account" : "Chosen on this device"}
            draft={draft}
            profile={profile}
            chosenFile={chosenFile}
            onReplace={onReplace}
          />
        ) : (
          <p className="wj-apply__empty">No CV is attached yet.</p>
        )}
      </div>

      <div className="wj-apply__card">
        <div className="wj-apply__head">
          <h2>Contact details</h2>
          {editing ? null : (
            <button type="button" className="wj-apply__text" onClick={onEdit}>
              Change
            </button>
          )}
        </div>
        {editing ? (
          <div className="wj-apply__fields">
            <Field id="firstName" label="First name" error={errors.firstName}>
              <input id="firstName" autoComplete="given-name" value={draft.firstName} aria-invalid={Boolean(errors.firstName)} onChange={(event) => update({ firstName: event.target.value })} />
            </Field>
            <Field id="surname" label="Surname" error={errors.surname}>
              <input id="surname" autoComplete="family-name" value={draft.surname} aria-invalid={Boolean(errors.surname)} onChange={(event) => update({ surname: event.target.value })} />
            </Field>
            <Field id="email" label="Email address" error={errors.email}>
              <input id="email" autoComplete="email" inputMode="email" value={draft.email} aria-invalid={Boolean(errors.email)} onChange={(event) => update({ email: event.target.value })} />
            </Field>
            <Field id="telephone" label="Telephone number" error={errors.telephone}>
              <input id="telephone" autoComplete="tel" inputMode="tel" value={draft.telephone} aria-invalid={Boolean(errors.telephone)} onChange={(event) => update({ telephone: event.target.value })} />
            </Field>
            <Field id="addressLine" label="Address" error={errors.addressLine}>
              <input id="addressLine" autoComplete="address-line1" value={draft.addressLine} onChange={(event) => update({ addressLine: event.target.value })} />
            </Field>
            <Field id="town" label="Town" error={errors.town}>
              <input id="town" autoComplete="address-level2" value={draft.town} aria-invalid={Boolean(errors.town)} onChange={(event) => update({ town: event.target.value })} />
            </Field>
            <Field id="postcode" label="Postcode" error={errors.postcode}>
              <input id="postcode" autoComplete="postal-code" value={draft.postcode} aria-invalid={Boolean(errors.postcode)} onChange={(event) => update({ postcode: event.target.value })} />
            </Field>
          </div>
        ) : (
          <dl className="wj-apply__rows">
            <div className="wj-apply__row">
              <dt>Name</dt>
              <dd>
                {draft.firstName} {draft.surname}
              </dd>
            </div>
            <div className="wj-apply__row">
              <dt>Email</dt>
              <dd>{draft.email}</dd>
            </div>
            <div className="wj-apply__row">
              <dt>Telephone</dt>
              <dd>{draft.telephone}</dd>
            </div>
            <div className="wj-apply__row">
              <dt>Address</dt>
              <dd>{address}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="wj-apply__card">
        <div className="wj-apply__head">
          <h2>From your CV</h2>
          {editingCv ? null : (
            <button type="button" className="wj-apply__text" onClick={onEditCv}>
              Edit
            </button>
          )}
        </div>
        {editingCv ? (
          <CvEditor draft={draft} errors={errors} update={update} />
        ) : (
          <CvSummary draft={draft} />
        )}
      </div>
    </div>
  );
}

function CvFile({
  fileName,
  note,
  draft,
  profile,
  chosenFile,
  onReplace,
}: {
  fileName: string;
  note: string;
  draft: ApplicationDraft;
  profile: PracticeProfile;
  chosenFile: File | null;
  onReplace: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploadedText, setUploadedText] = useState("");
  const [viewNote, setViewNote] = useState("");

  const view = async () => {
    setViewNote("");
    if (draft.cvChoice === "sample") {
      setOpen((current) => !current);
      return;
    }
    if (!chosenFile) {
      setViewNote("This file name is saved, but the document is not kept on the account. Upload it again if you want to open it.");
      return;
    }
    if (chosenFile.type.startsWith("text/") || chosenFile.name.toLowerCase().endsWith(".txt")) {
      setUploadedText(await chosenFile.text());
      setOpen((current) => !current);
      return;
    }
    const url = URL.createObjectURL(chosenFile);
    window.open(url, "_blank", "noopener");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <>
      <div className="wj-apply__file">
        <div className="wj-apply__ficon" aria-hidden="true">
          {fileKind(fileName)}
        </div>
        <div>
          <strong>{fileName}</strong>
          <small>{note}</small>
        </div>
        <div className="wj-apply__acts">
          <button type="button" className="wj-apply__text" onClick={() => void view()}>
            {open ? "Hide" : "View"}
          </button>
          <button type="button" className="wj-apply__text" onClick={onReplace}>
            Upload a different CV
          </button>
        </div>
      </div>
      {viewNote ? <p className="wj-apply__empty">{viewNote}</p> : null}
      {open && draft.cvChoice === "sample" ? (
        <div className="wj-apply__preview">
          <SampleCv profile={profile} cv={cvContent(draft)} />
        </div>
      ) : null}
      {open && draft.cvChoice !== "sample" ? <pre className="wj-cv-view">{uploadedText}</pre> : null}
    </>
  );
}
