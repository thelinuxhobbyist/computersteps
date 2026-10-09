"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useLearner } from "../../lib/learner-session";
import { COUNCIL_STORAGE_PREFIX, type CouncilRequest } from "./council-data";

export function getCouncilStorageKey(username: string) {
  return `${COUNCIL_STORAGE_PREFIX}:${username}`;
}

function readCouncilRequests(username: string | null | undefined): CouncilRequest[] {
  if (!username || typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getCouncilStorageKey(username));
    const parsed = raw ? (JSON.parse(raw) as CouncilRequest[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCouncilRequests(username: string | null | undefined) {
  const requests = useSyncExternalStore(
    (listener) => {
      if (!username || typeof window === "undefined") return () => undefined;
      const key = getCouncilStorageKey(username);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
    () => readCouncilRequests(username),
    () => [],
  );

  const saveRequests = (next: CouncilRequest[]) => {
    if (!username || typeof window === "undefined") return;
    const key = getCouncilStorageKey(username);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    } catch {
      // Ignore storage failure and keep the session in memory only.
    }
  };

  const addRequest = (request: CouncilRequest) => {
    const next = [request, ...requests];
    saveRequests(next);
  };

  return { requests, addRequest };
}

export function CouncilGate({ children }: { children: (username: string) => ReactNode }) {
  const username = useLearner();

  if (username === undefined) return <p className="council-empty">Loading your resident account…</p>;
  if (!username) {
    return (
      <div className="council-empty council-empty--alert">
        <h2>Sign in to your Computer Steps account</h2>
        <p>Use the same username you already use for Practice Bank or Westford Energy. Your resident account is tied to your existing account.</p>
      </div>
    );
  }

  return <>{children(username)}</>;
}
