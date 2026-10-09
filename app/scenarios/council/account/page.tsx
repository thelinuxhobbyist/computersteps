"use client";

import Link from "next/link";
import { COUNCIL_BASE, RESIDENT, formatCouncilDate, councilRequestStatus } from "../council-data";
import { CouncilGate, useCouncilRequests } from "../council-session";

export default function CouncilAccountPage() {
  return (
    <CouncilGate>
      {(username) => <ResidentAccount username={username} />}
    </CouncilGate>
  );
}

function ResidentAccount({ username }: { username: string }) {
  const { requests } = useCouncilRequests(username);

  return (
    <div className="council-wrap council-section">
      <h1>My Account</h1>
      <div className="council-account-grid">
        <section className="council-account-box">
          <div>
            <p className="council-date">Resident account</p>
            <h2>{RESIDENT.fullName}</h2>
          </div>

          <dl>
            <div><dt>Resident number</dt><dd>{RESIDENT.residentNumber}</dd></div>
            <div><dt>Address</dt><dd>{RESIDENT.addressLine1}, {RESIDENT.townOrCity}, {RESIDENT.postcode}</dd></div>
            <div><dt>Contact</dt><dd>{RESIDENT.phone}</dd></div>
            <div><dt>Username</dt><dd>{username}</dd></div>
          </dl>
        </section>

        <section className="council-panel">
          <h2>Recent activity</h2>
          <ul className="council-list">
            <li>Latest Council Tax bill issued for the 2026/27 period.</li>
            <li>Next bin collection is on {formatCouncilDate("2026-10-15")}.</li>
            <li>Your contact messages and service requests stay visible here.</li>
          </ul>
        </section>
      </div>

      <div className="council-section">
        <h2>Submitted requests</h2>
        {requests.length === 0 ? (
          <p>No requests yet. Use the council website to report a problem, ask a question or request a service.</p>
        ) : (
          <ul className="council-list">
            {requests.slice(0, 6).map((request) => (
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
        <Link href={`${COUNCIL_BASE}/council-tax/`} className="council-btn council-btn--primary">Council Tax</Link>
        <Link href={`${COUNCIL_BASE}/report/`} className="council-btn council-btn--secondary">Report a problem</Link>
        <Link href={`${COUNCIL_BASE}/contact/`} className="council-btn council-btn--secondary">Contact us</Link>
      </div>
    </div>
  );
}
