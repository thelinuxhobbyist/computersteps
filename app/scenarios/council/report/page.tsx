"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COUNCIL_BASE, makeCouncilReference } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function CouncilReportPage() {
  return (
    <CouncilGate>
      {(username) => <ReportContent username={username} />}
    </CouncilGate>
  );
}

function ReportContent({ username }: { username: string }) {
  const { addRequest } = useCouncilRequests(username);
  const [problem, setProblem] = useState("Pothole");
  const [location, setLocation] = useState("Church Street");
  const [description, setDescription] = useState("A large pothole has appeared near the crossing.");
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ref = makeCouncilReference();
    addRequest({
      id: `${Date.now()}`,
      kind: "report",
      topic: "Report a problem",
      subject: problem,
      location,
      body: description,
      reference: ref,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setReference(ref);
  };

  return (
    <div className="council-wrap council-section">
      <h1>Report a Problem</h1>
      <p>Let Westford Council know about a local issue such as a pothole, damaged bin or broken streetlight.</p>

      {submitted && reference ? (
        <div className="council-success">
          Problem reported. Your reference is <strong>{reference}</strong>. A council officer will review it and update your account.
        </div>
      ) : null}

      <form className="council-form" onSubmit={handleSubmit}>
        <div className="council-field">
          <label htmlFor="problem-type" className="council-label">Type of problem</label>
          <select id="problem-type" className="council-select" value={problem} onChange={(event) => setProblem(event.target.value)}>
            <option value="Pothole">Pothole</option>
            <option value="Broken streetlight">Broken streetlight</option>
            <option value="Fly tipping">Fly tipping</option>
            <option value="Damaged public bin">Damaged public bin</option>
          </select>
        </div>

        <div className="council-field">
          <label htmlFor="problem-location" className="council-label">Location</label>
          <input id="problem-location" className="council-input" value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>

        <div className="council-field">
          <label htmlFor="problem-details" className="council-label">Description</label>
          <textarea id="problem-details" className="council-textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>

        <button type="submit" className="council-button council-button--primary">Submit report</button>
      </form>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">View account</Link>
      </div>
    </div>
  );
}
