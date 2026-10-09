"use client";

import { useEffect, useState } from "react";
import { clearLearner, setLearner } from "../../lib/learner-session";
import { createUsernameStore } from "../../lib/username-store";
import { getEnergy, type GetEnergyResult } from "./energy-api";
import type { EnergyAccount } from "./energy-data";

const store = createUsernameStore("computer-steps:westford-energy-username");

export function logIn(username: string) {
  store.logIn(username);
  setLearner(username);
}

export function logOut() {
  store.logOut();
  clearLearner();
}

export const useEnergyUsername = store.useUsername;

export type EnergyAccountState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-found"; username: string }
  | { status: "error"; retry: () => void }
  | { status: "ready"; energy: EnergyAccount; update: (energy: EnergyAccount) => void };

type Loaded = { username: string; result: GetEnergyResult };

export function useEnergyAccount(): EnergyAccountState {
  const username = useEnergyUsername();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getEnergy(username).then((result) => {
      if (!cancelled) setLoaded({ username, result });
    });
    return () => {
      cancelled = true;
    };
  }, [username, reloadCount]);

  if (username === undefined) return { status: "loading" };
  if (username === null) return { status: "signed-out" };
  if (!loaded || loaded.username !== username) return { status: "loading" };
  if (loaded.result.status === "ready") {
    return { status: "ready", energy: loaded.result.energy, update: (energy) => setLoaded({ username, result: { status: "ready", energy } }) };
  }
  if (loaded.result.status === "not-found") return { status: "not-found", username };
  return { status: "error", retry: () => setReloadCount((count) => count + 1) };
}
