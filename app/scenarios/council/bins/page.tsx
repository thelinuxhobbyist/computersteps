"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendCouncilRequest } from "../council-api";
import { COUNCIL_BASE, formatCouncilDate } from "../council-data";
import { CouncilGate } from "../council-session";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function CouncilBinsPage() {
  return <CouncilGate>{(account, replace) => <BinsContent account={account} replace={replace} />}</CouncilGate>;
}

function BinsContent({ account, replace }: { account: CouncilAccount; replace: (account: CouncilAccount) => void }) {
  const [reference, setReference] = useState<string | null>(null);
  const [location, setLocation] = useState(account.addressLine1);
  const [problem, setProblem] = useState("Missed collection");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const result = await sendCouncilRequest(account.username, {
      kind: "bins",
      topic: "Bins and recycling",
      location,
      message: `${problem} reported for ${location}.`,
    });
    setSending(false);
    if (result.ok) {
      replace(result.council);
      setReference(result.reference);
      setError("");
      return;
    }
    setError("We couldn't save that request. Add a little more detail, then try again.");
  };

  return (
    <div className="council-wrap council-section">
      <h1>Bins &amp; Recycling</h1>
      <div className="council-account-grid">
        <section className="council-panel">
          <h2>Next collection</h2>
          <p className="council-date">{formatCouncilDate(account.bins.nextDate)}</p>
          <p>
            <strong>Bin:</strong> {account.bins.binType}
          </p>
          <p>{account.bins.briefing}</p>
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
        {reference ? (
          <div className="council-success" role="status">
            Request saved. Your reference is <strong>{reference}</strong>.
          </div>
        ) : null}
        <form className="council-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p className="council-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="council-field">
            <label htmlFor="bin-address" className="council-label">
              Address
            </label>
            <input id="bin-address" className="council-input" value={location} onChange={(event) => setLocation(event.target.value)} />
          </div>
          <div className="council-field">
            <label htmlFor="bin-problem" className="council-label">
              Problem
            </label>
            <select id="bin-problem" className="council-select" value={problem} onChange={(event) => setProblem(event.target.value)}>
              <option value="Missed collection">Missed collection</option>
              <option value="Replacement bin">Replacement bin</option>
              <option value="Recycling issue">Recycling issue</option>
            </select>
          </div>
          <button type="submit" className="council-button council-button--primary" disabled={sending}>
            {sending ? "Sending…" : "Submit request"}
          </button>
        </form>
      </section>
      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
          Back to My Account
        </Link>
      </div>
    </div>
  );
}
