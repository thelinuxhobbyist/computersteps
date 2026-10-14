"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendCouncilRequest } from "../council-api";
import { COUNCIL_BASE } from "../council-data";
import { CouncilGate } from "../council-session";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function HousingPage() {
  return <CouncilGate>{(account, replace) => <HousingContent account={account} replace={replace} />}</CouncilGate>;
}

function HousingContent({ account, replace }: { account: CouncilAccount; replace: (account: CouncilAccount) => void }) {
  const [topic, setTopic] = useState("Housing application");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const result = await sendCouncilRequest(account.username, {
      kind: "housing",
      topic,
      message: `${account.fullName} is asking for information about ${topic.toLowerCase()}.`,
    });
    setSending(false);
    if (result.ok) {
      replace(result.council);
      setReference(result.reference);
      setError("");
      return;
    }
    setError("We couldn't save that enquiry. Try again.");
  };

  return (
    <div className="council-wrap council-section">
      <h1>Housing Services</h1>
      <div className="council-grid">
        <div className="council-panel">
          <h2>Housing information</h2>
          <p>We can help with repairs, housing applications, tenant support and changes to your details.</p>
          <p>
            This request is saved for <strong>{account.fullName}</strong>.
          </p>
        </div>
        <div className="council-panel">
          <h2>Practice enquiry</h2>
          <p>The council stores a fictional housing request on your resident account. No real housing application is sent.</p>
        </div>
      </div>
      {reference ? (
        <div className="council-success" style={{ marginTop: "24px" }} role="status">
          Housing enquiry saved. Reference <strong>{reference}</strong>.
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
            <label htmlFor="housing-type" className="council-label">
              What do you need help with?
            </label>
            <select id="housing-type" className="council-select" value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option value="Housing application">Housing application</option>
              <option value="Repairs">Repairs</option>
              <option value="Change of address">Change of address</option>
            </select>
          </div>
          <button type="submit" className="council-button council-button--primary" disabled={sending}>
            {sending ? "Sending…" : "Submit enquiry"}
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
