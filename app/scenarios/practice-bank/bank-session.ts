"use client";

import { useEffect, useState } from "react";
import { createUsernameStore } from "../../lib/username-store";
import { getAccount } from "./bank-api";
import type { BankAccount } from "./bank-data";

const store = createUsernameStore("computer-steps:practice-bank-username");

export const { logIn, logOut } = store;
export const useBankUsername = store.useUsername;

export type BankAccountState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-found"; username: string }
  | { status: "error"; retry: () => void }
  | { status: "ready"; account: BankAccount; refresh: () => void };

type Loaded = { username: string; result: Awaited<ReturnType<typeof getAccount>> };

export function useBankAccount(): BankAccountState {
  const username = useBankUsername();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    getAccount(username).then((result) => {
      if (!cancelled) setLoaded({ username, result });
    });
    return () => {
      cancelled = true;
    };
  }, [username, reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);

  if (username === undefined) return { status: "loading" };
  if (username === null) return { status: "signed-out" };
  if (!loaded || loaded.username !== username) return { status: "loading" };
  if (loaded.result.status === "ready") return { status: "ready", account: loaded.result.account, refresh: reload };
  if (loaded.result.status === "not-found") return { status: "not-found", username };
  return { status: "error", retry: reload };
}
