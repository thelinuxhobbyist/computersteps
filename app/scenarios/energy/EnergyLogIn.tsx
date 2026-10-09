"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { BANK_BASE } from "../practice-bank/bank-data";
import { useBankUsername } from "../practice-bank/bank-session";
import { getEnergy } from "./energy-api";
import { ENERGY_BASE } from "./energy-data";
import { logIn, useEnergyUsername } from "./energy-session";

export default function EnergyLogIn() {
  const router = useRouter();
  const currentUser = useEnergyUsername();
  const bankUser = useBankUsername();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<"missing" | "not-found" | "unavailable" | null>(null);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const typed = username.trim();
    if (!typed) {
      setError("missing");
      inputRef.current?.focus();
      return;
    }
    setChecking(true);
    const result = await getEnergy(typed);
    setChecking(false);
    if (result.status === "ready") {
      logIn(result.energy.username);
      router.push(`${ENERGY_BASE}/account/`);
    } else {
      setError(result.status === "not-found" ? "not-found" : "unavailable");
      inputRef.current?.focus();
    }
  };

  if (currentUser) {
    return (
      <div className="we-login">
        <h2>Welcome back</h2>
        <p>
          You are logged in as <strong>{currentUser}</strong>.
        </p>
        <Link href={`${ENERGY_BASE}/account/`} className="we-btn we-btn--primary">
          Go to my account <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <form className="we-login" onSubmit={handleSubmit} noValidate>
      <h2>Log in to your account</h2>
      <div className={`we-field ${error ? "has-error" : ""}`}>
        <label htmlFor="we-login-username" className="we-label">
          Username
        </label>
        <p id="we-login-username-hint" className="we-hint">
          Use the same username as your Practice Bank account{bankUser ? `, like ${bankUser}` : ""}.
        </p>
        {error ? (
          <p id="we-login-username-error" className="we-error" role="alert">
            {error === "missing" && "Please type your username."}
            {error === "unavailable" && "We couldn't reach our website. Check you are connected to the internet, then try again."}
            {error === "not-found" && (
              <>
                We can&rsquo;t find an account for {username.trim()}. Check the spelling. If you don&rsquo;t have a Practice Bank
                account yet, <Link href={`${BANK_BASE}/open-account/`}>open one first</Link>.
              </>
            )}
          </p>
        ) : null}
        <input
          ref={inputRef}
          id="we-login-username"
          className="we-input"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setError(null);
          }}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={`we-login-username-hint${error ? " we-login-username-error" : ""}`}
        />
      </div>
      <button type="submit" className="we-btn we-btn--primary we-btn--full" disabled={checking}>
        {checking ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
