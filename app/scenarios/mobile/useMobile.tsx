"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { useLearner } from "../../lib/learner-session";
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

  if (username === undefined) return { status: "loading" as const };
  if (!username) return { status: "signed-out" as const };
  if (!loaded || loaded === "missing" || loaded === "error" || loaded.username !== username) {
    if (loaded === "missing") return { status: "missing" as const };
    if (loaded === "error") return { status: "error" as const, retry: () => setReloadCount((count) => count + 1) };
    return { status: "loading" as const };
  }
  return { status: "ready" as const, mobile: loaded.mobile, replace };
}

function SignIn() {
  return <ScenarioSignIn />;
}

export function MobileGate({ children }: { children: (mobile: MobileAccount, replace: (mobile: MobileAccount) => void) => ReactNode }) {
  const state = useMobileAccount();
  if (state.status === "loading") return <p className="ps-wrap">Loading your mobile account…</p>;
  if (state.status === "signed-out") return <div className="ps-wrap"><SignIn /></div>;
  if (state.status === "missing") {
    return (
      <div className="ps-wrap ps-panel">
        <h1>Open an account to continue</h1>
        <p>Open an account here to access all scenario sites across Computer Steps.</p>
        <ScenarioSignIn />
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
