"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendCouncilRequest } from "../council-api";
import { COUNCIL_BASE } from "../council-data";
import { CouncilGate } from "../council-session";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function CouncilReportPage() {
  return <CouncilGate>{(account, replace) => <ReportContent account={account} replace={replace} />}</CouncilGate>;
}

function ReportContent({ account, replace }: { account: CouncilAccount; replace: (account: CouncilAccount) => void }) {
  const [problem, setProblem] = useState("Pothole");
  const [location, setLocation] = useState(account.addressLine1);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const result = await sendCouncilRequest(account.username, {
      kind: "report",
      topic: problem,
      location,
      message: description || `${problem} reported at ${location}.`,
    });
    setSending(false);
    if (result.ok) {
      replace(result.council);
      setReference(result.reference);
      setError("");
      return;
    }
    setError("errors" in result ? result.errors.message || "Add a few more details, then try again." : "We couldn't save the report. Try again.");
  };

  return (
    <div className="council-wrap council-section">
      <h1>Report a Problem</h1>
      <p>Tell Westford Council about a local issue such as a pothole, damaged bin or broken streetlight.</p>
      {reference ? (
        <div className="council-success" role="status">
          Problem saved. Your reference is <strong>{reference}</strong>.
        </div>
      ) : null}
      <form className="council-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="council-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="council-field">
          <label htmlFor="problem-type" className="council-label">
            Type of problem
          </label>
          <select id="problem-type" className="council-select" value={problem} onChange={(event) => setProblem(event.target.value)}>
            <option value="Pothole">Pothole</option>
            <option value="Broken streetlight">Broken streetlight</option>
            <option value="Fly tipping">Fly tipping</option>
            <option value="Damaged public bin">Damaged public bin</option>
          </select>
        </div>
        <div className="council-field">
          <label htmlFor="problem-location" className="council-label">
            Location
          </label>
          <input id="problem-location" className="council-input" value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <div className="council-field">
          <label htmlFor="problem-details" className="council-label">
            Description
          </label>
          <textarea id="problem-details" className="council-textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <button type="submit" className="council-button council-button--primary" disabled={sending}>
          {sending ? "Sending…" : "Submit report"}
        </button>
      </form>
      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
          View account
        </Link>
      </div>
    </div>
  );
}
