"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccount } from "../practice-bank/bank-api";
import { practiceProfileFromIdentity, type PracticeProfile } from "../../../workers/practice-bank/src/shared/practice-profile";
import { SampleCv } from "./SampleCv";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { clearLearner, useLearner } from "../../lib/learner-session";
import { APPLICATION_STATUS_LABELS, cvContent, type ApplicationDraft, type ApplicationStatus } from "../../../workers/practice-bank/src/shared/job-application";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { formatLocation, formatUkDate } from "../../../workers/practice-bank/src/shared/jobs";
import { getJobsAccount, unsaveVacancy, type JobsAccount, type PracticeApplication } from "./jobs-api";
import { safeJobsPath } from "./jobs-client";

function SavedDetails({ username }: { username: string }) {
  const [profile, setProfile] = useState<PracticeProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccount(username).then((result) => {
      if (cancelled || result.status !== "ready") return;
      setProfile(
        practiceProfileFromIdentity({
          fullName: result.account.fullName,
          addressLine1: result.account.addressLine1,
          townOrCity: result.account.townOrCity,
          postcode: result.account.postcode,
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!profile) return null;

  return (
    <section className="wj-panel" style={{ padding: 16, margin: "16px 0" }}>
      <h2>Details saved on your account</h2>
      <p>Job applications use these details and your CV. You do not type them again for each job.</p>
      <dl className="wj-facts">
        <dt>Name</dt>
        <dd>{profile.fullName}</dd>
        <dt>Email</dt>
        <dd>{profile.email}</dd>
        <dt>Telephone</dt>
        <dd>{profile.telephone}</dd>
        <dt>Address</dt>
        <dd>
          {profile.addressLine}, {profile.town}, {profile.postcode}
        </dd>
      </dl>
    </section>
  );
}

function statusLabel(status: string) {
  return status in APPLICATION_STATUS_LABELS ? APPLICATION_STATUS_LABELS[status as ApplicationStatus] : status;
}

function useAccount() {
  const username = useLearner();
  const [loaded, setLoaded] = useState<{ username: string; account: JobsAccount | null } | null>(null);

  const reload = async (name: string) => {
    setLoaded({ username: name, account: await getJobsAccount(name) });
  };

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getJobsAccount(username).then((account) => {
      if (!cancelled) setLoaded({ username, account });
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const account = username === undefined || username === null ? (username === undefined ? undefined : null) : loaded?.username === username ? loaded.account : undefined;
  return { username, account, reload };
}

export function AccountHome() {
  const params = useSearchParams();
  const router = useRouter();
  const username = useLearner();
  const next = safeJobsPath(params.get("next"));

  useEffect(() => {
    if (username && next) router.replace(next);
  }, [username, next, router]);

  if (username === undefined || (username && next)) return <p className="ps-wrap">Loading…</p>;

  if (!username) {
    return (
      <div className="ps-wrap">
        <h1>My account</h1>
        <p>Sign in to save jobs and manage your applications.</p>
        <ScenarioSignIn />
      </div>
    );
  }

  return (
    <div className="ps-wrap">
      <h1>My account</h1>
      <p>
        You are signed in as <strong>{username}</strong>. The same username works on every Computer Steps practice website.
      </p>
      <SavedDetails username={username} />
      <ul>
        <li>
          <Link href="/scenarios/jobs/saved/">Saved jobs</Link>
        </li>
        <li>
          <Link href="/scenarios/jobs/applications/">My applications</Link>
        </li>
        <li>
          <Link href="/scenarios/jobs/exercises/">Guided exercises</Link>
        </li>
      </ul>
      <div className="wj-note" role="note">
        <p>
          Saved jobs and applications stay on your account. Sign in with the same details when you come back.
        </p>
      </div>
      <button
        type="button"
        className="wj-btn wj-btn--ghost"
        onClick={() => {
          if (!window.confirm("Sign out of Computer Steps on this device?")) return;
          clearLearner();
          router.push("/scenarios/jobs/find/");
        }}
      >
        Sign out
      </button>
    </div>
  );
}

export function SavedJobs() {
  const { username, account, reload } = useAccount();
  const [message, setMessage] = useState("");

  if (username === undefined || account === undefined) return <p className="ps-wrap">Loading…</p>;
  if (!username) {
    return (
      <div className="ps-wrap">
        <h1>Saved jobs</h1>
        <p>Sign in to see the jobs you have saved.</p>
        <ScenarioSignIn />
      </div>
    );
  }
  if (!account) {
    return (
      <div className="ps-wrap">
        <h1>Saved jobs</h1>
        <p role="alert">Your saved jobs could not be loaded. Check your connection and try again.</p>
      </div>
    );
  }

  const jobs = account.saved.map((item) => findVacancy(item.jobId)).filter((job) => job !== undefined);

  return (
    <div className="ps-wrap">
      <h1>Saved jobs</h1>
      {message ? <p role="status">{message}</p> : null}
      {jobs.length === 0 ? (
        <div className="wj-note" role="status">
          <p>You have no saved jobs yet. Open a vacancy and select Save job.</p>
          <Link className="wj-btn" href="/scenarios/jobs/find/">
            Find jobs
          </Link>
        </div>
      ) : (
        jobs.map((job) => (
          <article className="wj-job" key={job.id}>
            <h2>
              <Link href={`/scenarios/jobs/job/?id=${job.id}`}>{job.title}</Link>
            </h2>
            <p className="wj-job__employer">{job.employer}</p>
            <p>{formatLocation(job)}</p>
            <p className="wj-pay">{job.payLabel}</p>
            <p>Reference {job.reference}</p>
            <button
              type="button"
              className="wj-btn wj-btn--ghost"
              onClick={async () => {
                if (!window.confirm(`Remove ${job.title} from Saved jobs?`)) return;
                const next = await unsaveVacancy(username, job.id);
                if (!next) {
                  setMessage("The job could not be removed. Check your connection and try again.");
                  return;
                }
                setMessage(`${job.title} has been removed from Saved jobs.`);
                await reload(username);
              }}
            >
              Remove saved job
            </button>
          </article>
        ))
      )}
    </div>
  );
}

export function Applications() {
  const { username, account } = useAccount();
  if (username === undefined || account === undefined) return <p className="ps-wrap">Loading…</p>;
  if (!username) {
    return (
      <div className="ps-wrap">
        <h1>My applications</h1>
        <p>Sign in to see the jobs you have applied for.</p>
        <ScenarioSignIn />
      </div>
    );
  }
  if (!account) {
    return (
      <div className="ps-wrap">
        <h1>My applications</h1>
        <p role="alert">Your applications could not be loaded. Check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="ps-wrap">
      <h1>My applications</h1>
      {account.applications.length === 0 ? (
        <div className="wj-note" role="status">
          <p>You have not applied for a job yet.</p>
          <Link className="wj-btn" href="/scenarios/jobs/find/">
            Find a job to apply for
          </Link>
        </div>
      ) : (
        account.applications.map((application) => (
          <article className="wj-job" key={application.reference}>
            <h2>
              <Link href={`/scenarios/jobs/applications/view/?ref=${encodeURIComponent(application.reference)}`}>{application.jobTitle}</Link>
            </h2>
            <p className="wj-job__employer">{application.employer}</p>
            <p>Applied {formatUkDate(application.submittedAt.slice(0, 10))}</p>
            <p>Reference {application.reference}</p>
            <p>
              Status: <strong>{statusLabel(application.status)}</strong>
            </p>
          </article>
        ))
      )}
    </div>
  );
}

export function ApplicationView() {
  const params = useSearchParams();
  const { username, account } = useAccount();
  const reference = params.get("ref") ?? "";

  if (username === undefined || account === undefined) return <p className="ps-wrap">Loading…</p>;
  if (!username) {
    return (
      <div className="ps-wrap">
        <h1>Application</h1>
        <p>Sign in to open an application on your account.</p>
        <ScenarioSignIn />
      </div>
    );
  }

  const application = account?.applications.find((item) => item.reference === reference);
  if (!application) {
    return (
      <div className="ps-wrap">
        <h1>Application not found</h1>
        <p>That reference is not on this account. Open My applications and choose one of your own.</p>
        <Link className="wj-btn" href="/scenarios/jobs/applications/">
          My applications
        </Link>
      </div>
    );
  }

  return (
    <div className="ps-wrap">
      <p>
        <Link href="/scenarios/jobs/applications/">← My applications</Link>
      </p>
      <ApplicationBody application={application} />
    </div>
  );
}

export function ApplyDone() {
  const params = useSearchParams();
  const { username, account } = useAccount();
  const reference = params.get("ref") ?? "";
  if (username === undefined || account === undefined) return <p className="ps-wrap">Loading…</p>;
  const application = account?.applications.find((item) => item.reference === reference);

  return (
    <div className="ps-wrap">
      <h1>Application submitted</h1>
      <div className="wj-ok" role="status">
        <p>
          <strong>Thank you.</strong> This practice application is saved on your account. It has not been sent to an employer. The CV file was not kept. Keep the reference for your records.
        </p>
      </div>
      {application ? (
        <>
          <dl className="wj-facts">
            <dt>Reference</dt>
            <dd>{application.reference}</dd>
            <dt>Job</dt>
            <dd>{application.jobTitle}</dd>
            <dt>Employer</dt>
            <dd>{application.employer}</dd>
            <dt>Submitted</dt>
            <dd>{formatUkDate(application.submittedAt.slice(0, 10))}</dd>
            <dt>Status</dt>
            <dd>{statusLabel(application.status)}</dd>
          </dl>
        </>
      ) : (
        <p>Reference {reference || "not available"}. Open My applications if you need to see the record.</p>
      )}
      <div className="wj-actions">
        <Link className="wj-btn" href="/scenarios/jobs/applications/">
          My applications
        </Link>
        <Link className="wj-btn wj-btn--ghost" href="/scenarios/jobs/find/">
          Find another job
        </Link>
        <Link className="wj-btn wj-btn--ghost" href="/scenarios/mail/">
          Open Westford Mail
        </Link>
      </div>
    </div>
  );
}

function SavedCvView({ form }: { form: ApplicationDraft }) {
  const [open, setOpen] = useState(false);
  if (form.cvChoice !== "sample") {
    return <p>The document was not kept. Only the file name is saved with this practice application.</p>;
  }
  return (
    <div className="wj-cv-view-wrap">
      <button type="button" className="wj-btn wj-btn--ghost" onClick={() => setOpen((current) => !current)}>
        {open ? "Hide CV" : "View CV"}
      </button>
      {open ? (
        <SampleCv
          profile={{
            firstName: form.firstName,
            surname: form.surname,
            fullName: `${form.firstName} ${form.surname}`.trim(),
            email: form.email,
            telephone: form.telephone,
            addressLine: form.addressLine,
            town: form.town,
            postcode: form.postcode,
          }}
          cv={{ ...cvContent(form), statement: form.statement }}
        />
      ) : null}
    </div>
  );
}

function ApplicationBody({ application }: { application: PracticeApplication }) {
  const form = application.form;
  return (
    <article>
      <h1>{application.jobTitle}</h1>
      <p className="wj-job__employer">{application.employer}</p>
      <p>{application.location}</p>
      <dl className="wj-facts">
        <dt>Reference</dt>
        <dd>{application.reference}</dd>
        <dt>Submitted</dt>
        <dd>{formatUkDate(application.submittedAt.slice(0, 10))}</dd>
        <dt>Status</dt>
        <dd>{statusLabel(application.status)}</dd>
      </dl>
      {application.interview ? (
        <section className="wj-panel" style={{ padding: 16 }}>
          <h2>Interview invitation</h2>
          <dl className="wj-facts">
            <dt>Date</dt>
            <dd>{formatUkDate(application.interview.date)}</dd>
            <dt>Time</dt>
            <dd>{application.interview.time}</dd>
            <dt>Place</dt>
            <dd>{application.interview.location}</dd>
          </dl>
          <p>{application.interview.instructions}</p>
        </section>
      ) : null}
      {form ? (
        <>
          <h2>Details saved with this application</h2>
          <dl className="wj-facts">
            {form.cvFileName ? (
              <>
                <dt>CV</dt>
                <dd>
                  {form.cvFileName}
                  <SavedCvView form={form} />
                </dd>
              </>
            ) : null}
            <dt>Name</dt>
            <dd>
              {form.firstName} {form.surname}
            </dd>
            <dt>Email</dt>
            <dd>{form.email}</dd>
            <dt>Telephone</dt>
            <dd>{form.telephone}</dd>
            <dt>Address</dt>
            <dd>{[form.addressLine, form.town, form.postcode].filter(Boolean).join(", ")}</dd>
            <dt>Employment</dt>
            <dd>
              {cvContent(form).jobs.length === 0
                ? "No previous paid employment"
                : cvContent(form).jobs.map((job) => `${job.jobTitle} at ${job.employerName}, ${job.dateFrom} to ${job.dateTo}`).join("; ")}
              {form.duties ? `. ${form.duties}` : ""}
            </dd>
            <dt>Skills</dt>
            <dd>{cvContent(form).skillItems.filter(Boolean).join(". ") || form.skills}</dd>
            <dt>Experience</dt>
            <dd>{form.previousExperience}</dd>
            <dt>Qualifications</dt>
            <dd>{cvContent(form).qualificationItems.filter(Boolean).join(". ") || form.qualifications}</dd>
            <dt>Statement</dt>
            <dd>{form.statement}</dd>
          </dl>
        </>
      ) : null}
    </article>
  );
}
