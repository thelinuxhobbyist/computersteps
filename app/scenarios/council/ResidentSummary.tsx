"use client";

import Link from "next/link";
import { COUNCIL_BASE } from "./council-data";
import { useCouncilAccount } from "./council-session";

export default function ResidentSummary() {
  const state = useCouncilAccount();

  return (
    <div className="council-panel">
      <h3>Resident details</h3>
      {state.status === "ready" ? (
        <>
          <p>
            <strong>{state.account.fullName}</strong>
          </p>
          <p>{state.account.addressLine1}</p>
          <p>{state.account.townOrCity}</p>
          <p>{state.account.postcode}</p>
          <p>Council Tax reference: {state.account.councilTaxReference}</p>
        </>
      ) : (
        <p>Sign in with your Computer Steps username to see the name and address saved on your practice account.</p>
      )}
      <div className="council-actions">
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
          {state.status === "ready" ? "My account" : "Sign in"}
        </Link>
      </div>
    </div>
  );
}
