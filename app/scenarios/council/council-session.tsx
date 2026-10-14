"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { setLearner, useLearner } from "../../lib/learner-session";
import { getAccount } from "../practice-bank/bank-api";
import { BANK_BASE } from "../practice-bank/bank-data";
import { getCouncil } from "./council-api";
import { COUNCIL_BASE } from "./council-data";
import type { CouncilAccount } from "../../../workers/practice-bank/src/shared/council-types";

export function useCouncilAccount() {
  const username = useLearner();
  const [loaded, setLoaded] = useState<{ username: string; result: Awaited<ReturnType<typeof getCouncil>> } | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getCouncil(username).then((result) => {
      if (!cancelled) setLoaded({ username, result });
    });
    return () => {
      cancelled = true;
    };
  }, [username, reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);
  const replace = (council: CouncilAccount) => {
    if (!username) return;
    setLoaded({ username, result: { status: "ready", council } });
  };

  if (username === undefined) return { status: "loading" as const };
  if (username === null) return { status: "signed-out" as const };
  if (!loaded || loaded.username !== username) return { status: "loading" as const };
  if (loaded.result.status === "ready") return { status: "ready" as const, account: loaded.result.council, reload, replace };
  if (loaded.result.status === "not-found") return { status: "not-found" as const, username };
  return { status: "error" as const, retry: reload };
}

function CouncilSignIn() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const typed = username.trim();
    if (!typed) {
      setError("Type the username you use for Computer Steps.");
      return;
    }
    setChecking(true);
    const result = await getAccount(typed);
    setChecking(false);
    if (result.status === "ready") {
      setLearner(result.account.username);
      setError("");
      return;
    }
    setError(
      result.status === "not-found"
        ? "We can't find that username. Open a Practice Bank account first, then come back to this page."
        : "We couldn't reach the practice website. Check your connection, then try again.",
    );
  };

  return (
    <div className="council-wrap council-section">
      <form className="council-form" onSubmit={submit} noValidate>
        <h1>Sign in</h1>
        <p>Use the same Computer Steps username as Practice Bank, Westford Energy and the other practice websites.</p>
        {error ? (
          <p className="council-error" role="alert">
            {error}{" "}
            {error.includes("Practice Bank") ? <Link href={`${BANK_BASE}/open-account/`}>Open a Practice Bank account</Link> : null}
          </p>
        ) : null}
        <div className="council-field">
          <label htmlFor="council-username" className="council-label">
            Username
          </label>
          <input
            id="council-username"
            className="council-input"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <button type="submit" className="council-button council-button--primary" disabled={checking}>
          {checking ? "Checking…" : "Sign in"}
        </button>
        <p>
          <Link href={`${COUNCIL_BASE}/`}>Back to the council home page</Link>
        </p>
      </form>
    </div>
  );
}

export function CouncilGate({ children }: { children: (account: CouncilAccount, replace: (account: CouncilAccount) => void) => ReactNode }) {
  const state = useCouncilAccount();
  if (state.status === "loading") return <p className="council-empty">Loading your resident account…</p>;
  if (state.status === "signed-out") return <CouncilSignIn />;
  if (state.status === "not-found") {
    return (
      <div className="council-empty council-empty--alert">
        <h2>Open a Practice Bank account first</h2>
        <p>Westford Council uses your Computer Steps account. There is no separate council registration.</p>
        <p>
          <Link href={`${BANK_BASE}/open-account/`}>Open a Practice Bank account</Link>
        </p>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="council-empty council-empty--alert">
        <h2>We couldn&apos;t load your account</h2>
        <button type="button" className="council-button council-button--primary" onClick={state.retry}>
          Try again
        </button>
      </div>
    );
  }
  return <>{children(state.account, state.replace)}</>;
}
