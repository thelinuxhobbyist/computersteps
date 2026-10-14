"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { setLearner, useLearner } from "../../lib/learner-session";
import { getAccount } from "../practice-bank/bank-api";
import { BANK_BASE } from "../practice-bank/bank-data";
import { getMobile } from "./mobile-api";
import type { MobileAccount } from "../../../workers/practice-bank/src/shared/mobile-types";

export function useMobileAccount() {
  const username = useLearner();
  const [loaded, setLoaded] = useState<{ username: string; mobile: MobileAccount } | "missing" | "error" | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getMobile(username).then((result) => {
      if (cancelled) return;
      if (result.status === "ready") setLoaded({ username, mobile: result.mobile });
      else setLoaded(result.status === "not-found" ? "missing" : "error");
    });
    return () => {
      cancelled = true;
    };
  }, [username, reloadCount]);

  const replace = (mobile: MobileAccount) => {
    if (username) setLoaded({ username, mobile });
  };

  if (username === undefined || (username && (!loaded || (loaded !== "missing" && loaded !== "error" && loaded.username !== username)))) {
    return { status: "loading" as const };
  }
  if (!username) return { status: "signed-out" as const };
  if (loaded === "missing") return { status: "missing" as const };
  if (loaded === "error") return { status: "error" as const, retry: () => setReloadCount((count) => count + 1) };
  return { status: "ready" as const, mobile: loaded.mobile, replace };
}

function SignIn() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim()) {
      setError("Type your Computer Steps username.");
      return;
    }
    setBusy(true);
    const result = await getAccount(username.trim());
    setBusy(false);
    if (result.status === "ready") {
      setLearner(result.account.username);
      return;
    }
    setError(result.status === "not-found" ? "Open a Practice Bank account first, then come back." : "We couldn't reach the practice website. Try again.");
  };
  return (
    <form className="ps-panel" onSubmit={submit} noValidate>
      <h1>Sign in</h1>
      <p>Use the same username as Practice Bank. Westford Mobile does not have a separate registration.</p>
      {error ? <p className="ps-error">{error}</p> : null}
      <div className="ps-field">
        <label htmlFor="wm-user">Username</label>
        <input id="wm-user" value={username} autoComplete="username" onChange={(event) => setUsername(event.target.value)} />
      </div>
      <button className="ps-btn" type="submit" disabled={busy}>
        {busy ? "Checking…" : "Sign in"}
      </button>
      <p>
        <Link href={`${BANK_BASE}/open-account/`}>Open a Practice Bank account</Link>
      </p>
    </form>
  );
}

export function MobileGate({ children }: { children: (mobile: MobileAccount, replace: (mobile: MobileAccount) => void) => ReactNode }) {
  const state = useMobileAccount();
  if (state.status === "loading") return <p className="ps-wrap">Loading your mobile account…</p>;
  if (state.status === "signed-out") return <div className="ps-wrap"><SignIn /></div>;
  if (state.status === "missing") {
    return (
      <div className="ps-wrap ps-panel">
        <h1>Open a Practice Bank account first</h1>
        <p>
          <Link href={`${BANK_BASE}/open-account/`}>Open an account</Link>
        </p>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="ps-wrap">
        <p className="ps-error">We couldn&apos;t load your account.</p>
        <button type="button" className="ps-btn" onClick={state.retry}>
          Try again
        </button>
      </div>
    );
  }
  return <>{children(state.mobile, state.replace)}</>;
}
