"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BANK_BASE, type BankAccount } from "../bank-data";
import { logOut, useBankAccount } from "../bank-session";

/** Shows the page only when someone is logged in, and explains what to do when they are not. */
export default function AccountGate({ children }: { children: (account: BankAccount, refresh: () => void) => ReactNode }) {
  const state = useBankAccount();

  if (state.status === "loading") {
    return <p className="pb-loading">Loading your account…</p>;
  }

  if (state.status === "signed-out") {
    return (
      <div className="pb-panel pb-notice">
        <h1>Please log in</h1>
        <p>You need to log in to see this page.</p>
        <Link href={`${BANK_BASE}/`} className="pb-btn pb-btn--primary">
          Go to log in
        </Link>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="pb-panel pb-notice">
        <h1>We can&rsquo;t find that account</h1>
        <p>
          There is no account called <strong>{state.username}</strong>. It may have been closed because it was not used for 12 months.
        </p>
        <Link href={`${BANK_BASE}/`} className="pb-btn pb-btn--primary" onClick={logOut}>
          Log in or open a new account
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="pb-panel pb-notice">
        <h1>Something went wrong</h1>
        <p>We couldn&rsquo;t reach Practice Bank. Check you are connected to the internet, then try again.</p>
        <button type="button" className="pb-btn pb-btn--primary" onClick={state.retry}>
          Try again
        </button>
      </div>
    );
  }

  return <>{children(state.account, state.refresh)}</>;
}
