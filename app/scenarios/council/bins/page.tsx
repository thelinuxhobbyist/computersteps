"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COUNCIL_BASE, BIN_COLLECTIONS, makeCouncilReference } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function CouncilBinsPage() {
  return (
    <CouncilGate>
      {(username) => <BinsContent username={username} />}
    </CouncilGate>
  );
}

function BinsContent({ username }: { username: string }) {
  const { addRequest } = useCouncilRequests(username);
  const [reference, setReference] = useState<string | null>(null);
  const [location, setLocation] = useState("17 River Walk");
  const [problem, setProblem] = useState("Missed collection");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newReference = makeCouncilReference();
    addRequest({
      id: `${Date.now()}`,
      kind: "bins",
      topic: "Bins & Recycling",
      subject: "Missed collection",
      location,
      body: `${problem} reported for ${location}.`,
      reference: newReference,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    setReference(newReference);
  };

  return (
    <div className="council-wrap council-section">
      <h1>Bins &amp; Recycling</h1>
      <div className="council-account-grid">
        <section className="council-panel">
          <h2>Next collection</h2>
          <p className="council-date">{BIN_COLLECTIONS.nextDate}</p>
          <p><strong>Bin:</strong> {BIN_COLLECTIONS.binType}</p>
          <p>{BIN_COLLECTIONS.briefing}</p>
        </section>

        <section className="council-panel">
          <h2>Household guidance</h2>
          <ul className="council-list">
            <li>Blue bin: paper, cardboard, tins and plastic bottles</li>
            <li>Green bin: food waste and garden waste</li>
            <li>Black bin: general rubbish</li>
          </ul>
        </section>
      </div>

      <section className="council-section">
        <h2>Report a missed collection</h2>
        {reference ? <div className="council-success">Request submitted. Your reference is <strong>{reference}</strong>.</div> : null}
        <form className="council-form" onSubmit={handleSubmit}>
          <div className="council-field">
            <label htmlFor="bin-address" className="council-label">Address</label>
            <input id="bin-address" className="council-input" value={location} onChange={(event) => setLocation(event.target.value)} />
          </div>
          <div className="council-field">
            <label htmlFor="bin-problem" className="council-label">Problem</label>
            <select id="bin-problem" className="council-select" value={problem} onChange={(event) => setProblem(event.target.value)}>
              <option value="Missed collection">Missed collection</option>
              <option value="Replacement bin">Replacement bin</option>
              <option value="Recycling issue">Recycling issue</option>
            </select>
          </div>
          <button type="submit" className="council-button council-button--primary">Submit request</button>
        </form>
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">Back to My Account</Link>
      </div>
    </div>
  );
}
