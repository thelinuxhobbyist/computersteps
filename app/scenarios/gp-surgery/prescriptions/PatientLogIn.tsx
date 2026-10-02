"use client";

import { useRef, useState, type FormEvent } from "react";
import { checkUsername } from "../../practice-bank/bank-data";
import { getPatient, registerPatient } from "../gp-api";
import { logInPatient } from "../gp-session";

const NO_CONNECTION = "We couldn't reach the surgery. Check you are connected to the internet, then try again.";

type UsernameFormProps = {
  id: string;
  title: string;
  intro: string;
  label: string;
  hint: string;
  button: string;
  busyButton: string;
  onSubmit: (username: string) => Promise<string>;
};

function UsernameForm({ id, title, intro, label, hint, button, busyButton, onSubmit }: UsernameFormProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const problem = await onSubmit(username.trim());
    setBusy(false);
    if (problem) {
      setError(problem);
      inputRef.current?.focus();
    }
  };

  return (
    <form className="gp-rx-panel" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      <p>{intro}</p>
      <div className={`gp-field ${error ? "has-error" : ""}`}>
        <label htmlFor={id} className="gp-label">
          {label}
        </label>
        <p id={`${id}-hint`} className="gp-field__hint">
          {hint}
        </p>
        {error ? (
          <p id={`${id}-error`} className="gp-field__error" role="alert">
            <span className="gp-visually-hidden">Error: </span>
            {error}
          </p>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          className="gp-input"
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
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        />
      </div>
      <button type="submit" className="gp-btn gp-btn--primary" disabled={busy}>
        {busy ? busyButton : button}
      </button>
    </form>
  );
}

export default function PatientLogIn({ onRegistered }: { onRegistered: () => void }) {
  const logIn = async (username: string) => {
    if (!username) return "Please type your username.";
    const result = await getPatient(username);
    if (result.status === "ready") {
      logInPatient(result.patient.username);
      return "";
    }
    if (result.status === "not-found") return `We can't find a patient called ${username}. Check the spelling, or register below.`;
    return NO_CONNECTION;
  };

  const register = async (username: string) => {
    const problem = checkUsername(username);
    if (problem) return problem;
    const result = await registerPatient(username);
    if (result.ok) {
      onRegistered();
      logInPatient(result.patient.username);
      return "";
    }
    if (result.reason === "taken") return `Someone is already using ${username}. If it is you, log in above. If not, try ${username}2.`;
    if (result.reason === "invalid") return result.message || checkUsername(username);
    return NO_CONNECTION;
  };

  return (
    <section aria-labelledby="gp-rx-heading">
      <h2 id="gp-rx-heading" className="gp-consult__title" tabIndex={-1}>
        Log in to order your medicine
      </h2>
      <div className="gp-rx-login">
        <UsernameForm
          id="gp-rx-login-username"
          title="Log in"
          intro="Already registered? Type your username."
          label="Username"
          hint="The username you chose when you registered, like JohnSmith."
          button="Log in"
          busyButton="Checking…"
          onSubmit={logIn}
        />
        <UsernameForm
          id="gp-rx-register-username"
          title="New patient? Register"
          intro="Choose a username. We will set up your pretend patient record with your own repeat medicines."
          label="Choose a username"
          hint="Letters and numbers only, with no spaces. For example: JohnSmith or Mary72. Do not use your real full name."
          button="Register"
          busyButton="Registering…"
          onSubmit={register}
        />
      </div>
    </section>
  );
}
