"use client";

import Link from "next/link";
import { useState } from "react";
import { COUNCIL_BASE, COUNCIL_BILL, RESIDENT, formatCouncilDate, makeCouncilReference } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function CouncilTaxPage() {
  return (
    <CouncilGate>
      {(username) => <TaxContent username={username} />}
    </CouncilGate>
  );
}

function TaxContent({ username }: { username: string }) {
  const { addRequest, requests } = useCouncilRequests(username);
  const [amount, setAmount] = useState("186.45");
  const [submitted, setSubmitted] = useState(false);

  const pay = () => {
    const reference = makeCouncilReference();
    addRequest({
      id: `${Date.now()}`,
      kind: "council-tax",
      topic: "Council Tax payment",
      subject: "Payment confirmation",
      body: `Payment of ${amount} was simulated for Council Tax account ${RESIDENT.councilTaxReference}. Reference ${reference}.`,
      reference,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  const requestCount = requests.filter((item) => item.kind === "council-tax").length;

  return (
    <div className="council-wrap council-section">
      <h1>Council Tax</h1>
      <div className="council-warning">
        <h2>Urgent reminder</h2>
        <p>Your latest bill is ready. Please check the amount and payment date before the due date.</p>
      </div>

      <div className="council-account-grid">
        <section className="council-panel">
          <h2>Current bill</h2>
          <p><strong>Reference:</strong> {COUNCIL_BILL.reference}</p>
          <p><strong>Billing period:</strong> {COUNCIL_BILL.year}</p>
          <p><strong>Amount due:</strong> £{(COUNCIL_BILL.amountPence / 100).toFixed(2)}</p>
          <p><strong>Due date:</strong> {formatCouncilDate(COUNCIL_BILL.dueOn)}</p>
          <p><strong>Instalments:</strong> {COUNCIL_BILL.instalments} monthly payments</p>
        </section>

        <section className="council-panel">
          <h2>Payment history</h2>
          <ul className="council-list">
            {COUNCIL_BILL.paymentHistory.map((item) => (
              <li key={item.label}><strong>{item.label}</strong> — £{(item.amountPence / 100).toFixed(2)}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="council-section">
        <h2>Pay by card (practice only)</h2>
        <div className="council-form">
          <div className="council-field">
            <label htmlFor="council-tax-payment" className="council-label">Payment amount</label>
            <input id="council-tax-payment" className="council-input" type="text" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>
          <button type="button" className="council-button council-button--primary" onClick={pay}>Pay now</button>
          {submitted ? <div className="council-success">Payment submitted. Your account now shows the request in your account history.</div> : null}
          {requestCount > 0 ? <p>Practice payments logged: {requestCount}</p> : null}
        </div>
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">Back to My Account</Link>
      </div>
    </div>
  );
}
