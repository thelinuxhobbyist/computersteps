"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { useLearner } from "../../lib/learner-session";
import { getAccount } from "../practice-bank/bank-api";
import { applicationFromProfile, validateDraft, type ApplicationDraft } from "../../../workers/practice-bank/src/shared/job-application";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { formatLocation } from "../../../workers/practice-bank/src/shared/jobs";
import {
  SAMPLE_CV_FILE_NAME,
  cvFileError,
  practiceProfileFromIdentity,
  sampleCvText,
  type PracticeProfile,
} from "../../../workers/practice-bank/src/shared/practice-profile";
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
        <p>Open a vacancy, then select Apply now.</p>
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
    const found = validateDraft(draft, "all");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = Object.keys(found)[0];
      const next = STEP_FOR_FIELD[first] ?? "review";
      setStep(next);
      if (next === "review") setEditing(true);
      return;
    }
    if (!username) {
      setErrors({ form: "Sign in to submit this application. Your saved details stay on your account." });
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
    setErrors({ form: "The application could not be submitted. Check your connection and try again." });
  };

  return (
    <div className="ps-wrap">
      <p>
        <Link href={`/scenarios/jobs/job/?id=${job.id}`}>← Back to the job</Link>
      </p>
      <h1>Apply for this job</h1>
      <p className="wj-lead">
        {job.title} at {job.employer}, {formatLocation(job)}.
      </p>
      <div className="wj-note" role="note">
        <p>This application is for practice. It is not sent to a real employer.</p>
        <p>Your name, address and CV are already saved on your Computer Steps account. You do not type them again for each job.</p>
      </div>
      {job.suspicious ? (
        <div className="wj-warn" role="note">
          <p>
            This advert asks for something this application will not collect. You can still apply. Do not type bank details, passwords or copies of identity documents.
          </p>
        </div>
      ) : null}

      {username === undefined ? <p>Loading your saved details…</p> : null}
      {username === null ? (
        <div>
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

          {step === "cv" ? (
            <CvStep
              draft={draft}
              profile={profile}
              chosenFile={chosenFile}
              errors={errors}
              fileNote={fileNote}
              fileRef={fileRef}
              onSample={() => rememberCv("sample", SAMPLE_CV_FILE_NAME)}
              onFile={chooseFile}
              onRemove={() => {
                if (fileRef.current) fileRef.current.value = "";
                setChosenFile(null);
                update({ cvChoice: "", cvFileName: "" });
              }}
              onReplace={() => {
                if (fileRef.current) fileRef.current.value = "";
                fileRef.current?.click();
              }}
            />
          ) : null}
          {step === "review" ? (
            <ReviewStep
              draft={draft}
              profile={profile}
              chosenFile={chosenFile}
              editing={editing}
              errors={errors}
              update={update}
              onEdit={() => setEditing(true)}
              onCv={() => setStep("cv")}
            />
          ) : null}

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
                  if (validateCurrent()) setStep("review");
                }}
              >
                Review your details
              </button>
            ) : (
              <button type="button" className="wj-btn wj-btn--accent" disabled={busy} onClick={() => void submit()}>
                {busy ? "Submitting application…" : "Submit application"}
              </button>
            )}
          </div>
        </>
      ) : null}
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
  fileRef,
  onSample,
  onFile,
  onRemove,
  onReplace,
}: {
  draft: ApplicationDraft;
  profile: PracticeProfile;
  chosenFile: File | null;
  errors: Record<string, string>;
  fileNote: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onSample: () => void;
  onFile: (file: File | undefined) => void;
  onRemove: () => void;
  onReplace: () => void;
}) {
  const attached = draft.cvChoice === "sample" || (draft.cvChoice === "upload" && draft.cvFileName);

  return (
    <div>
      <h2>Your CV</h2>
      <p>The sample CV is already on your account. You can keep it, or upload a different file.</p>
      <div className="wj-warn" role="note">
        <p>Do not upload a real CV unless you are comfortable doing so. A practice CV is enough. Westford Jobs keeps the file name only. The document is not stored and is not sent to an employer.</p>
      </div>
      {attached ? (
        <div className="wj-cv-file">
          <p>
            Selected file: <strong>{draft.cvChoice === "sample" ? SAMPLE_CV_FILE_NAME : draft.cvFileName}</strong>
          </p>
          <p>{draft.cvChoice === "sample" ? "This is the sample CV saved on your account." : "This file was chosen on this device."}</p>
          <CvPreview draft={draft} profile={profile} chosenFile={chosenFile} />
        </div>
      ) : (
        <p>No CV is attached yet.</p>
      )}
      {errors.cvChoice || errors.cvFileName || fileNote ? (
        <p className="wj-error" role="alert">
          {errors.cvFileName || errors.cvChoice || fileNote}
        </p>
      ) : null}
      <div className="wj-actions">
        {draft.cvChoice !== "sample" ? (
          <button type="button" className="wj-btn" onClick={onSample}>
            Use the sample CV
          </button>
        ) : null}
        <button type="button" className="wj-btn wj-btn--ghost" onClick={onReplace}>
          Upload a different CV
        </button>
        {attached ? (
          <button type="button" className="wj-btn wj-btn--ghost" onClick={onRemove}>
            Remove attachment
          </button>
        ) : null}
      </div>
      <input
        ref={fileRef}
        id="cvFile"
        className="wj-cv-input"
        type="file"
        accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,text/plain"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
    </div>
  );
}

function ReviewStep({
  draft,
  profile,
  chosenFile,
  editing,
  errors,
  update,
  onEdit,
  onCv,
}: {
  draft: ApplicationDraft;
  profile: PracticeProfile;
  chosenFile: File | null;
  editing: boolean;
  errors: Record<string, string>;
  update: (patch: Partial<ApplicationDraft>) => void;
  onEdit: () => void;
  onCv: () => void;
}) {
  const address = [draft.addressLine, draft.town, draft.postcode].filter(Boolean).join(", ");
  return (
    <div>
      <h2>Review your details</h2>
      <p>These details are saved on your account and taken from your CV. Read them, then apply.</p>
      <h3>CV</h3>
      <p>
        <strong>{draft.cvFileName || "No CV attached"}</strong>
      </p>
      {draft.cvFileName ? <CvPreview draft={draft} profile={profile} chosenFile={chosenFile} /> : null}
      <button type="button" className="wj-btn wj-btn--ghost" onClick={onCv}>
        Upload a different CV
      </button>
      <h3>Contact details</h3>
      {editing ? (
        <div>
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
        <dl className="wj-facts">
          <dt>Name</dt>
          <dd>
            {draft.firstName} {draft.surname}
          </dd>
          <dt>Email</dt>
          <dd>{draft.email}</dd>
          <dt>Telephone</dt>
          <dd>{draft.telephone}</dd>
          <dt>Address</dt>
          <dd>{address}</dd>
        </dl>
      )}
      {editing ? null : (
        <button type="button" className="wj-btn wj-btn--ghost" onClick={onEdit}>
          Change contact details
        </button>
      )}
      <h3>From your CV</h3>
      <dl className="wj-facts">
        <dt>Recent job</dt>
        <dd>
          {draft.jobTitle} at {draft.employerName}, {draft.dateFrom} to {draft.dateTo}
        </dd>
        <dt>What you did</dt>
        <dd>{draft.duties}</dd>
        <dt>Skills</dt>
        <dd>{draft.skills}</dd>
        <dt>Qualifications</dt>
        <dd>{draft.qualifications}</dd>
      </dl>
      <div className="wj-note" role="note">
        <p>Check the details above. You can change your contact details before you submit. The CV file is not kept after you apply.</p>
      </div>
    </div>
  );
}

function CvPreview({ draft, profile, chosenFile }: { draft: ApplicationDraft; profile: PracticeProfile; chosenFile: File | null }) {
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
    <div className="wj-cv-view-wrap">
      <button type="button" className="wj-btn wj-btn--ghost" onClick={() => void view()}>
        {open ? "Hide CV" : "View CV"}
      </button>
      {viewNote ? <p>{viewNote}</p> : null}
      {open ? <pre className="wj-cv-view">{draft.cvChoice === "sample" ? sampleCvText(profile) : uploadedText}</pre> : null}
    </div>
  );
}
