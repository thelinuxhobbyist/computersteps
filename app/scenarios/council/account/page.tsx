"use client";

import Link from "next/link";
import { COUNCIL_BASE, formatCouncilDate, councilRequestStatus } from "../council-data";
import { CouncilGate } from "../council-session";
import { formatMoney } from "../../practice-bank/bank-data";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function CouncilAccountPage() {
  return <CouncilGate>{(account) => <ResidentAccount account={account} />}</CouncilGate>;
}

function ResidentAccount({ account }: { account: CouncilAccount }) {
  return (
    <div className="council-wrap council-section">
      <h1>My Account</h1>
      <div className="council-account-grid">
        <section className="council-account-box">
          <div>
            <p className="council-date">Resident account</p>
            <h2>{account.fullName}</h2>
          </div>
          <dl>
            <div>
              <dt>Resident number</dt>
              <dd>{account.residentNumber}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                {account.addressLine1}, {account.townOrCity}, {account.postcode}
              </dd>
            </div>
            <div>
              <dt>Council Tax reference</dt>
              <dd>{account.councilTaxReference}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{account.username}</dd>
            </div>
          </dl>
        </section>

        <section className="council-panel">
          <h2>Council Tax</h2>
          <p>
            Amount still to pay: <strong>{formatMoney(account.balancePence)}</strong>
          </p>
          <p>Next bin collection is on {formatCouncilDate(account.bins.nextDate)}.</p>
          <p>Your messages and service requests stay on this account.</p>
        </section>
      </div>

      <div className="council-section">
        <h2>Submitted requests</h2>
        {account.requests.length === 0 ? (
          <p>No requests yet. Use the council website to report a problem, ask a question or request a service.</p>
        ) : (
          <ul className="council-list">
            {account.requests.slice(0, 6).map((request) => (
              <li key={request.id}>
                <strong>{request.topic}</strong>
                <div className="council-status">{councilRequestStatus(request.status)}</div>
                <p>Reference: {request.reference}</p>
                {request.location ? <p>Location: {request.location}</p> : null}
                <p>{request.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/council-tax/`} className="council-btn council-btn--primary">
          Council Tax
        </Link>
        <Link href={`${COUNCIL_BASE}/report/`} className="council-btn council-btn--secondary">
          Report a problem
        </Link>
        <Link href={`${COUNCIL_BASE}/contact/`} className="council-btn council-btn--secondary">
          Contact us
        </Link>
      </div>
    </div>
  );
}
