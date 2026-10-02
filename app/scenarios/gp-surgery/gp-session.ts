"use client";

import { useEffect, useState } from "react";
import { createUsernameStore } from "../../lib/username-store";
import { getPatient } from "./gp-api";
import type { Patient } from "./prescription-order";

const store = createUsernameStore("computer-steps:gp-username");

export const { logIn: logInPatient, logOut: logOutPatient } = store;

export type PatientState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-found"; username: string }
  | { status: "error"; retry: () => void }
  | { status: "ready"; patient: Patient; replace: (patient: Patient) => void };

type Loaded = { username: string; result: Awaited<ReturnType<typeof getPatient>> };

export function usePatient(): PatientState {
  const username = store.useUsername();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getPatient(username).then((result) => {
      if (!cancelled) setLoaded({ username, result });
    });
    return () => {
      cancelled = true;
    };
  }, [username, reloadCount]);

  if (username === undefined) return { status: "loading" };
  if (username === null) return { status: "signed-out" };
  if (!loaded || loaded.username.toLowerCase() !== username.toLowerCase()) return { status: "loading" };
  if (loaded.result.status === "ready") {
    return {
      status: "ready",
      patient: loaded.result.patient,
      replace: (patient) => setLoaded({ username, result: { status: "ready", patient } }),
    };
  }
  if (loaded.result.status === "not-found") return { status: "not-found", username };
  return { status: "error", retry: () => setReloadCount((count) => count + 1) };
}
