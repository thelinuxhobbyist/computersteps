"use client";

import { useEffect } from "react";
import { createUsernameStore, IDENTITY_EVENT } from "./username-store";

// One ComputerSteps identity on this device. Signing in on any practice website writes every key,
// so Bank, Energy, Council and the GP surgery all see the same learner.
export const SESSION_KEYS = [
  "computer-steps:learner",
  "computer-steps:practice-bank-username",
  "computer-steps:westford-energy-username",
  "computer-steps:gp-username",
] as const;

const store = createUsernameStore(SESSION_KEYS[0]);

function broadcast(username: string | null) {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) {
    try {
      if (username) window.localStorage.setItem(key, username);
      else window.localStorage.removeItem(key);
    } catch {
      // Private browsing can block storage. The in-memory listeners still update for this page.
    }
  }
  window.dispatchEvent(new Event(IDENTITY_EVENT));
}

export function setLearner(username: string) {
  broadcast(username);
}

export function clearLearner() {
  broadcast(null);
}

export const useLearner = store.useUsername;

/** Keeps an older per-website username in step with the shared ComputerSteps identity. */
export function useLinkedUsername(local: string | null | undefined): string | null | undefined {
  const learner = useLearner();
  useEffect(() => {
    if (learner === undefined || local === undefined) return;
    if (learner && local !== learner) setLearner(learner);
    else if (!learner && local) setLearner(local);
  }, [learner, local]);
  if (learner === undefined || local === undefined) return undefined;
  return learner ?? local;
}
