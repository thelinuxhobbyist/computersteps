"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendCouncilRequest } from "../council-api";
import { COUNCIL_BASE } from "../council-data";
import { CouncilGate } from "../council-session";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function CouncilBenefitsPage() {
  return <CouncilGate>{(account, replace) => <BenefitsContent account={account} replace={replace} />}</CouncilGate>;
}

function BenefitsContent({ account, replace }: { account: CouncilAccount; replace: (account: CouncilAccount) => void }) {
  const [message, setMessage] = useState("I would like to find out whether I can get help with my household costs.");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const result = await sendCouncilRequest(account.username, { kind: "benefits", topic: "Benefits and support", message });
    setSending(false);
    if (result.ok) {
      replace(result.council);
      setReference(result.reference);
      setError("");
      return;
    }
    setError("errors" in result ? result.errors.message || "Write a short message, then try again." : "We couldn't save that enquiry. Try again.");
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
          <p>Send a message here. It stays on {account.fullName}&apos;s practice account. No real benefits claim is made.</p>
        </div>
      </div>
      {reference ? (
        <div className="council-success" style={{ marginTop: "24px" }} role="status">
          Support enquiry saved. Reference <strong>{reference}</strong>.
        </div>
      ) : null}
      <section className="council-section">
        <form className="council-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p className="council-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="council-field">
            <label htmlFor="benefits-message" className="council-label">
              What support do you need?
            </label>
            <textarea id="benefits-message" className="council-textarea" value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          <button type="submit" className="council-button council-button--primary" disabled={sending}>
            {sending ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      </section>
      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
          Back to account
        </Link>
      </div>
    </div>
  );
}
