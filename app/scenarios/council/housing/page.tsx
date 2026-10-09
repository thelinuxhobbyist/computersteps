"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COUNCIL_BASE, RESIDENT, makeCouncilReference } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function HousingPage() {
  return (
    <CouncilGate>
      {(username) => <HousingContent username={username} />}
    </CouncilGate>
  );
}

function HousingContent({ username }: { username: string }) {
  const { addRequest } = useCouncilRequests(username);
  const [requested, setRequested] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ref = makeCouncilReference();
    addRequest({
      id: `${Date.now()}`,
      kind: "housing",
      topic: "Housing enquiry",
      subject: "Housing application form",
      body: `${RESIDENT.fullName} is asking for information about housing applications and repairs.`,
      reference: ref,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    setReference(ref);
    setRequested(true);
  };

  return (
    <div className="council-wrap council-section">
      <h1>Housing Services</h1>
      <div className="council-grid">
        <div className="council-panel">
          <h2>Housing information</h2>
          <p>We can help with repairs, housing applications, tenant support and changes to your details.</p>
          <p><strong>Current status:</strong> Application enquiry in progress.</p>
        </div>
        <div className="council-panel">
          <h2>Practice enquiry</h2>
          <p>For this exercise, the council is storing a fictional housing request as part of your resident account.</p>
        </div>
      </div>

      {requested && reference ? (
        <div className="council-success" style={{ marginTop: "24px" }}>
          Housing enquiry submitted. Reference <strong>{reference}</strong>.
        </div>
      ) : null}

      <section className="council-section">
        <form className="council-form" onSubmit={handleSubmit}>
          <div className="council-field">
            <label htmlFor="housing-type" className="council-label">What do you need help with?</label>
            <select id="housing-type" className="council-select" defaultValue="Housing application">
              <option value="Housing application">Housing application</option>
              <option value="Repairs">Repairs</option>
              <option value="Move or change of address">Change of address</option>
            </select>
          </div>
          <button type="submit" className="council-button council-button--primary">Submit enquiry</button>
        </form>
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">Back to account</Link>
      </div>
    </div>
  );
}
