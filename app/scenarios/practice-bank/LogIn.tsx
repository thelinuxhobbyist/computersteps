"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCreditCard, faReceipt, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { getAccount } from "./bank-api";
import { BANK_BASE } from "./bank-data";
import { logIn, logOut, useBankUsername } from "./bank-session";

export default function LogIn() {
  const router = useRouter();
  const currentUser = useBankUsername();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const typed = username.trim();
    if (!typed) {
      setError("Please type your username.");
      inputRef.current?.focus();
      return;
    }

    setChecking(true);
    const result = await getAccount(typed);
    setChecking(false);

    if (result.status === "ready") {
      logIn(result.account.username);
      router.push(`${BANK_BASE}/account/`);
    } else if (result.status === "not-found") {
      setError(`We can't find an account called ${typed}. Check the spelling, or open a new account below.`);
      inputRef.current?.focus();
    } else {
      setError("We couldn't reach Practice Bank. Check you are connected to the internet, then try again.");
    }
  };

  return (
    <div className="pb-wrap pb-content">
      <section className="pb-welcome">
        <h1>Welcome to Practice Bank</h1>
        <p className="pb-lead">
          Your own pretend bank account and bank card. Use the card in the Practice Shop, then come back here to see your money go out.
        </p>
      </section>

      {currentUser ? (
        <div className="pb-panel pb-signed-in">
          <p>
            You are logged in as <strong>{currentUser}</strong>.
          </p>
          <div className="pb-actions">
            <Link href={`${BANK_BASE}/account/`} className="pb-btn pb-btn--primary">
              Go to my account <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
            <button type="button" className="pb-btn pb-btn--secondary" onClick={logOut}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <div className="pb-login-grid">
          <form className="pb-panel" onSubmit={handleSubmit} noValidate>
            <h2>Log in</h2>
            <div className={`pb-field ${error ? "has-error" : ""}`}>
              <label htmlFor="pb-login-username" className="pb-label">
                Username
              </label>
              <p id="pb-login-username-hint" className="pb-hint">
                The username you chose when you opened your account, like JohnSmith.
              </p>
              {error ? (
                <p id="pb-login-username-error" className="pb-error" role="alert">
                  {error}
                </p>
              ) : null}
              <input
                ref={inputRef}
                id="pb-login-username"
                className="pb-input"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={`pb-login-username-hint${error ? " pb-login-username-error" : ""}`}
              />
            </div>
            <button type="submit" className="pb-btn pb-btn--primary" disabled={checking}>
              {checking ? "Checking…" : "Log in"}
            </button>
          </form>

          <div className="pb-panel pb-panel--tint">
            <h2>New to Practice Bank?</h2>
            <p>Open an account in one step. You only need to choose a username.</p>
            <ul className="pb-ticks">
              <li>
                <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" /> Get a pretend bank card with £500 to spend
              </li>
              <li>
                <FontAwesomeIcon icon={faReceipt} aria-hidden="true" /> See your payments and statements
              </li>
              <li>
                <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" /> No real names, bank details or money
              </li>
            </ul>
            <Link href={`${BANK_BASE}/open-account/`} className="pb-btn pb-btn--primary">
              Open an account <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
