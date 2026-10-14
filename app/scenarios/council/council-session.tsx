"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { useLearner } from "../../lib/learner-session";
import { getCouncil } from "./council-api";
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
  return (
    <div className="council-wrap council-section">
      <ScenarioSignIn />
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
        <h2>Open an account to continue</h2>
        <p>Open an account here to access all scenario sites across Computer Steps.</p>
        <ScenarioSignIn />
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
