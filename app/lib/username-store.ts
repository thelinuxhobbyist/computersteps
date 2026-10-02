"use client";

import { useSyncExternalStore } from "react";

/** Remembers which practice username is logged in on this device. */
export function createUsernameStore(storageKey: string) {
  const listeners = new Set<() => void>();

  const read = (): string | null => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const write = (username: string | null) => {
    try {
      if (username) {
        window.localStorage.setItem(storageKey, username);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // Storage can be unavailable (private browsing); the learner just logs in again next time.
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    logIn: (username: string) => write(username),
    logOut: () => write(null),
    /** `undefined` until the page has loaded in the browser. */
    useUsername: (): string | null | undefined => useSyncExternalStore(subscribe, read, () => undefined),
  };
}
