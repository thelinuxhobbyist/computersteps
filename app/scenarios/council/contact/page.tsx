"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { COUNCIL_BASE, RESIDENT, makeCouncilReference } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function CouncilContactPage() {
  return (
    <CouncilGate>
      {(username) => <ContactContent username={username} />}
    </CouncilGate>
  );
}

function ContactContent({ username }: { username: string }) {
  const { addRequest } = useCouncilRequests(username);
  const [topic, setTopic] = useState("Council Tax");
  const [message, setMessage] = useState("I need help understanding my latest council tax bill.");
  const [sent, setSent] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ref = makeCouncilReference();
    addRequest({
      id: `${Date.now()}`,
      kind: "contact",
      topic: "Contact Us",
      subject: topic,
      body: message,
      reference: ref,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    setSent(true);
    setReference(ref);
  };

  return (
    <div className="council-wrap council-section">
      <h1>Contact Us</h1>
      <p>Send a message to Westford Council and keep track of it in your resident account.</p>

      {sent && reference ? (
        <div className="council-success">
          Message sent successfully. Reference <strong>{reference}</strong>. We aim to reply within two working days.
        </div>
      ) : null}

      <div className="council-grid">
        <div className="council-panel">
          <h2>Customer service</h2>
          <p>Phone: {RESIDENT.phone}</p>
          <p>Email: {RESIDENT.email}</p>
          <p>Address: {RESIDENT.addressLine1}, {RESIDENT.townOrCity}, {RESIDENT.postcode}</p>
        </div>

        <div className="council-panel">
          <h2>Common topics</h2>
          <ul className="council-list">
            <li>Council Tax</li>
            <li>Bins &amp; Recycling</li>
            <li>Housing enquiries</li>
            <li>Benefits &amp; support</li>
          </ul>
        </div>
      </div>

      <section className="council-section">
        <form className="council-form" onSubmit={handleSubmit}>
          <div className="council-field">
            <label htmlFor="contact-topic" className="council-label">Topic</label>
            <select id="contact-topic" className="council-select" value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option value="Council Tax">Council Tax</option>
              <option value="Bins & Recycling">Bins &amp; Recycling</option>
              <option value="Housing">Housing</option>
              <option value="Benefits & Support">Benefits &amp; support</option>
            </select>
          </div>

          <div className="council-field">
            <label htmlFor="contact-message" className="council-label">Message</label>
            <textarea id="contact-message" className="council-textarea" value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>

          <button type="submit" className="council-button council-button--primary">Send message</button>
        </form>
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">View account</Link>
      </div>
    </div>
  );
}
