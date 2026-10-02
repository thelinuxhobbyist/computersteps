"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import AddressLines from "../components/AddressLines";
import BankCard from "../components/BankCard";
import { createAccount } from "../bank-api";
import { BANK_BASE, checkUsername, formatCardNumber, formatMoney, type BankAccount } from "../bank-data";
import { logIn } from "../bank-session";

export default function OpenAccount() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [wroteItDown, setWroteItDown] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const readyHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (account) readyHeadingRef.current?.focus();
  }, [account]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const typed = username.trim();
    const problem = checkUsername(typed);
    if (problem) {
      setError(problem);
      inputRef.current?.focus();
      return;
    }

    setCreating(true);
    const result = await createAccount(typed);
    setCreating(false);

    if (result.ok) {
      logIn(result.account.username);
      setAccount(result.account);
      return;
    }
    setError(
      result.reason === "taken"
        ? `Someone is already using ${typed}. Try adding a number, like ${typed}2.`
        : result.reason === "invalid"
          ? result.message || checkUsername(typed)
          : "We couldn't reach Practice Bank. Check you are connected to the internet, then try again.",
    );
    inputRef.current?.focus();
  };

  const goToAccount = () => {
    if (!wroteItDown) {
      setConfirmError(true);
      return;
    }
    router.push(`${BANK_BASE}/account/`);
  };

  if (account) {
    return (
      <div className="pb-wrap pb-content">
        <div className="pb-confirmation">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="pb-confirmation__icon" />
          <h1 ref={readyHeadingRef} tabIndex={-1}>
            Your account is ready
          </h1>
          <p>
            You have <strong>{formatMoney(account.balancePence)}</strong> of pretend money to spend.
          </p>
        </div>

        <section className="pb-write-down" aria-labelledby="pb-write-down-heading">
          <h2 id="pb-write-down-heading">
            <FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" /> Write these down now
          </h2>
          <p>
            You will need your username to log in again. To pay in the Practice Shop you will need your card details, and the
            pretend name and address we have given you. The shop checks they all belong to the same person.
          </p>

          <div className="pb-card-layout">
            <dl className="pb-details pb-details--large">
              <div>
                <dt>Username</dt>
                <dd>{account.username}</dd>
              </div>
              <div>
                <dt>Full name</dt>
                <dd>{account.fullName}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  <AddressLines account={account} />
                </dd>
              </div>
              <div>
                <dt>Name on card</dt>
                <dd>{account.nameOnCard}</dd>
              </div>
              <div>
                <dt>Card number</dt>
                <dd>{formatCardNumber(account.cardNumber)}</dd>
              </div>
              <div>
                <dt>Expiry date</dt>
                <dd>{account.expiry}</dd>
              </div>
              <div>
                <dt>Security code</dt>
                <dd>{account.cvv}</dd>
              </div>
            </dl>
            <BankCard account={account} revealed />
          </div>

          <p className="pb-note">
            Lost them later? Log in and choose <strong>My card</strong> to see your card details, name and address again.
          </p>
        </section>

        <div className={`pb-field pb-confirm ${confirmError ? "has-error" : ""}`}>
          {confirmError ? (
            <p id="pb-wrote-it-down-error" className="pb-error" role="alert">
              Please write down your details, then tick the box.
            </p>
          ) : null}
          <div className="pb-checkbox">
            <input
              id="pb-wrote-it-down"
              type="checkbox"
              checked={wroteItDown}
              onChange={(event) => {
                setWroteItDown(event.target.checked);
                setConfirmError(false);
              }}
              aria-describedby={confirmError ? "pb-wrote-it-down-error" : undefined}
            />
            <label htmlFor="pb-wrote-it-down">I have written down my username, name, address and card details</label>
          </div>
        </div>

        <div className="pb-actions">
          <button type="button" className="pb-btn pb-btn--primary" onClick={goToAccount}>
            Go to my account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-wrap pb-content pb-narrow">
      <Link href={`${BANK_BASE}/`} className="pb-back">
        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back
      </Link>
      <h1>Open an account</h1>
      <p className="pb-lead">Choose a username. You will type it each time you log in, so pick something easy to remember.</p>

      <form className="pb-panel" onSubmit={handleSubmit} noValidate>
        <div className={`pb-field ${error ? "has-error" : ""}`}>
          <label htmlFor="pb-new-username" className="pb-label">
            Choose a username
          </label>
          <p id="pb-new-username-hint" className="pb-hint">
            Letters and numbers only, with no spaces. For example: JohnSmith or Mary72. Do not use your real full name.
          </p>
          {error ? (
            <p id="pb-new-username-error" className="pb-error" role="alert">
              {error}
            </p>
          ) : null}
          <input
            ref={inputRef}
            id="pb-new-username"
            className="pb-input pb-input--medium"
            value={username}
            maxLength={20}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={`pb-new-username-hint${error ? " pb-new-username-error" : ""}`}
          />
        </div>
        <button type="submit" className="pb-btn pb-btn--primary" disabled={creating}>
          {creating ? "Opening your account…" : "Open my account"}
        </button>
      </form>
    </div>
  );
}
