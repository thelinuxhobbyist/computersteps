"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { sendMessage, type FieldErrors } from "../energy-api";
import { CONTACT_TOPICS, ENERGY_BASE, type EnergyAccount } from "../energy-data";
import { useEnergyAccount } from "../energy-session";

export default function ContactForm() {
  const state = useEnergyAccount();

  if (state.status === "loading") return <p className="we-loading">Loading…</p>;
  if (state.status !== "ready") {
    return (
      <div className="we-panel">
        <p>You need to be logged in to send a message.</p>
        <Link href={`${ENERGY_BASE}/`} className="we-btn we-btn--primary">
          Log in
        </Link>
      </div>
    );
  }
  return <MessageForm energy={state.energy} update={state.update} />;
}

function MessageForm({ energy, update }: { energy: EnergyAccount; update: (energy: EnergyAccount) => void }) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState("");
  const [sending, setSending] = useState(false);
  const [sentReference, setSentReference] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    const result = await sendMessage(energy.username, topic, message);
    setSending(false);
    if (result.ok) {
      update(result.energy);
      setSentReference(result.energy.messages[0]?.reference ?? "");
      setTopic("");
      setMessage("");
      setErrors({});
      setProblem("");
    } else if ("errors" in result) {
      setErrors(result.errors);
      setProblem("");
    } else {
      setProblem("We couldn't send your message. Check you are connected to the internet, then try again.");
    }
  };

  if (sentReference !== null) {
    return (
      <div className="we-panel">
        <div className="we-confirmation" role="status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="we-confirmation__icon" />
          <div>
            <p>Thank you, {energy.fullName}. Your message is saved on this account. No email has been sent.</p>
            <p>
              Reference <strong>{sentReference}</strong>
            </p>
          </div>
        </div>
        <button type="button" className="we-btn we-btn--secondary" onClick={() => setSentReference(null)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="we-panel" onSubmit={submit} noValidate>
      {problem ? (
        <p className="we-error" role="alert">
          {problem}
        </p>
      ) : null}
      <p className="we-small">
        Sending as <strong>{energy.fullName}</strong>, account {energy.accountNumber}.
      </p>

      <div className={`we-field ${errors.topic ? "has-error" : ""}`}>
        <label htmlFor="we-topic" className="we-label">
          What is your message about?
        </label>
        {errors.topic ? (
          <p id="we-topic-error" className="we-error">
            {errors.topic}
          </p>
        ) : null}
        <select
          id="we-topic"
          className="we-input"
          value={topic}
          onChange={(event) => {
            setTopic(event.target.value);
            setErrors((current) => ({ ...current, topic: "" }));
          }}
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? "we-topic-error" : undefined}
        >
          <option value="">Choose a topic</option>
          {CONTACT_TOPICS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className={`we-field ${errors.message ? "has-error" : ""}`}>
        <label htmlFor="we-message" className="we-label">
          Your message
        </label>
        {errors.message ? (
          <p id="we-message-error" className="we-error">
            {errors.message}
          </p>
        ) : null}
        <textarea
          id="we-message"
          className="we-input we-textarea"
          rows={6}
          maxLength={2000}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setErrors((current) => ({ ...current, message: "" }));
          }}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "we-message-error" : undefined}
        />
      </div>

      <button type="submit" className="we-btn we-btn--primary" disabled={sending}>
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
