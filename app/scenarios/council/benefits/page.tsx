"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COUNCIL_BASE, makeCouncilReference } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function CouncilBenefitsPage() {
  return (
    <CouncilGate>
      {(username) => <BenefitsContent username={username} />}
    </CouncilGate>
  );
}

function BenefitsContent({ username }: { username: string }) {
  const { addRequest } = useCouncilRequests(username);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ref = makeCouncilReference();
    addRequest({
      id: `${Date.now()}`,
      kind: "benefits",
      topic: "Benefits & Support",
      subject: "Support service enquiry",
      body: "The resident needs information about support services and how to apply for help with living costs.",
      reference: ref,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    setReference(ref);
    setSubmitted(true);
  };

  return (
    <div className="council-wrap council-section">
      <h1>Benefits &amp; Support</h1>
      <div className="council-grid">
        <div className="council-panel">
          <h2>Support available</h2>
          <ul className="council-list">
            <li>Help with council tax support</li>
            <li>Support for low incomes</li>
            <li>Food and energy-related advice</li>
          </ul>
        </div>
        <div className="council-panel">
          <h2>How to apply</h2>
          <p>Use the phone number below or send a message through the contact form. This is a practice form only.</p>
        </div>
      </div>

      {submitted && reference ? (
        <div className="council-success" style={{ marginTop: "24px" }}>
          Support enquiry submitted. Reference <strong>{reference}</strong>. We will contact you when the request is reviewed.
        </div>
      ) : null}

      <section className="council-section">
        <form className="council-form" onSubmit={handleSubmit}>
          <div className="council-field">
            <label htmlFor="benefits-message" className="council-label">What support do you need?</label>
            <textarea id="benefits-message" className="council-textarea" defaultValue="I would like to find out whether I can get help with my household costs." />
          </div>
          <button type="submit" className="council-button council-button--primary">Send enquiry</button>
        </form>
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">Back to account</Link>
      </div>
    </div>
  );
}
