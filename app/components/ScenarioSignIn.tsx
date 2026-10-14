"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { setLearner, useLearner } from "../lib/learner-session";
import { createAccount, getAccount } from "../scenarios/practice-bank/bank-api";
import { checkUsername } from "../scenarios/practice-bank/bank-data";
import "./scenario-signin.css";

export function ScenarioSignIn({ onSignedIn }: { onSignedIn?: () => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const typed = username.trim();
    const problem = checkUsername(typed);
    if (problem) {
      setError(problem);
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    if (mode === "up") {
      const created = await createAccount(typed);
      setBusy(false);
      if (created.ok) {
        setLearner(created.account.username);
        onSignedIn?.();
        return;
      }
      setError(
        created.reason === "taken"
          ? `${typed} is already in use. Sign in with it, or choose another username.`
          : created.reason === "invalid"
            ? created.message || problem
            : "We couldn't open the account. Check you are connected to the internet, then try again.",
      );
      inputRef.current?.focus();
      return;
    }
    const found = await getAccount(typed);
    setBusy(false);
    if (found.status === "ready") {
      setLearner(found.account.username);
      onSignedIn?.();
      return;
    }
    setError(
      found.status === "not-found"
        ? "We can't find that username. Register if this is your first Computer Steps account."
        : "We couldn't reach Computer Steps. Check you are connected to the internet, then try again.",
    );
    inputRef.current?.focus();
  };

  return (
    <div className="cs-account">
      <div className="cs-account__tabs" role="tablist" aria-label="Account">
        <button type="button" role="tab" aria-selected={mode === "in"} onClick={() => { setMode("in"); setError(""); }}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === "up"} onClick={() => { setMode("up"); setError(""); }}>
          Register
        </button>
      </div>
      <form onSubmit={submit} noValidate>
        <h2>{mode === "in" ? "Sign in" : "Open an account"}</h2>
        <p>
          {mode === "in"
            ? "Use the same Computer Steps username on every practice website."
            : "Open an account here to access all scenario sites across Computer Steps."}
        </p>
        {error ? (
          <p className="cs-account__error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="cs-account__field">
          <label htmlFor="cs-account-username">Username</label>
          <input
            ref={inputRef}
            id="cs-account-username"
            value={username}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
          />
          <p>3 to 20 letters and numbers, with no spaces. For example, JohnSmith.</p>
        </div>
        <button type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Register"}
        </button>
      </form>
    </div>
  );
}

export function ScenarioGate({ children }: { children: ReactNode }) {
  const username = useLearner();
  if (username === undefined) return <p className="ps-wrap">Loading…</p>;
  if (!username) {
    return (
      <div className="ps-wrap">
        <ScenarioSignIn />
      </div>
    );
  }
  return children;
}
