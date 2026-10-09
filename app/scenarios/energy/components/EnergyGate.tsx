"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ENERGY_BASE, type EnergyAccount } from "../energy-data";
import { logOut, useEnergyAccount } from "../energy-session";

/** Shows the page only when someone is logged in, and explains what to do when they are not. */
export default function EnergyGate({ children }: { children: (energy: EnergyAccount, update: (energy: EnergyAccount) => void) => ReactNode }) {
  const state = useEnergyAccount();

  if (state.status === "loading") return <p className="we-loading">Loading your account…</p>;

  if (state.status === "signed-out") {
    return (
      <div className="we-wrap we-content">
        <div className="we-panel we-notice">
          <h1>Please log in</h1>
          <p>You need to log in to your online account to see this page.</p>
          <Link href={`${ENERGY_BASE}/`} className="we-btn we-btn--primary">
            Go to log in
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="we-wrap we-content">
        <div className="we-panel we-notice">
          <h1>We can&rsquo;t find that account</h1>
          <p>
            There is no account for <strong>{state.username}</strong>. It may have been closed because it was not used for 12 months.
          </p>
          <Link href={`${ENERGY_BASE}/`} className="we-btn we-btn--primary" onClick={logOut}>
            Log in again
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="we-wrap we-content">
        <div className="we-panel we-notice">
          <h1>Something went wrong</h1>
          <p>We couldn&rsquo;t load your account. Check you are connected to the internet, then try again.</p>
          <button type="button" className="we-btn we-btn--primary" onClick={state.retry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children(state.energy, state.update)}</>;
}
