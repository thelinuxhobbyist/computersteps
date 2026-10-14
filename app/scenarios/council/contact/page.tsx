"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COUNCIL } from "../../../../workers/practice-bank/src/shared/council";
import { sendCouncilRequest } from "../council-api";
import { COUNCIL_BASE } from "../council-data";
import { CouncilGate } from "../council-session";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function CouncilContactPage() {
  return <CouncilGate>{(account, replace) => <ContactContent account={account} replace={replace} />}</CouncilGate>;
}

function ContactContent({ account, replace }: { account: CouncilAccount; replace: (account: CouncilAccount) => void }) {
  const [topic, setTopic] = useState("Council Tax");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const result = await sendCouncilRequest(account.username, { kind: "contact", topic, message });
    setSending(false);
    if (result.ok) {
      replace(result.council);
      setReference(result.reference);
      setError("");
      setMessage("");
      return;
    }
    setError("errors" in result ? result.errors.message || result.errors.topic || "Check the form and try again." : "We couldn't send your message. Try again.");
  };

  return (
    <div className="council-wrap council-section">
      <h1>Contact Us</h1>
      <p>Send a message to Westford Council. It is saved on your resident account. Nothing is emailed.</p>

      {reference ? (
        <div className="council-success" role="status">
          Message saved. Reference <strong>{reference}</strong>. A practice reply is on your account. We do not send a real email.
        </div>
      ) : null}

      <div className="council-grid">
        <div className="council-panel">
          <h2>Customer service</h2>
          <p>Phone: {COUNCIL.phone}</p>
          <p>Email: {COUNCIL.email}</p>
          <p>This address is fictional and does not receive messages.</p>
          <p>{COUNCIL.addressLines.join(", ")}</p>
        </div>
        <div className="council-panel">
          <h2>Your details</h2>
          <p>{account.fullName}</p>
          <p>
            {account.addressLine1}, {account.townOrCity}, {account.postcode}
          </p>
          <p>Council Tax reference: {account.councilTaxReference}</p>
        </div>
      </div>

      <section className="council-section">
        <form className="council-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p className="council-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="council-field">
            <label htmlFor="contact-topic" className="council-label">
              Topic
            </label>
            <select id="contact-topic" className="council-select" value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option value="Council Tax">Council Tax</option>
              <option value="Bins and recycling">Bins and recycling</option>
              <option value="Housing">Housing</option>
              <option value="Benefits and support">Benefits and support</option>
            </select>
          </div>
          <div className="council-field">
            <label htmlFor="contact-message" className="council-label">
              Message
            </label>
            <textarea id="contact-message" className="council-textarea" value={message} onChange={(event) => setMessage(event.target.value)} required minLength={10} />
          </div>
          <button type="submit" className="council-button council-button--primary" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
          View account
        </Link>
      </div>
    </div>
  );
}
