"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../../components/EnergyGate";
import { sendMeterReading } from "../../energy-api";
import { ENERGY_BASE, formatDay, type EnergyAccount } from "../../energy-data";

export default function MeterReading() {
  return (
    <EnergyGate>
      {(energy, update) => (
        <div className="we-wrap we-content we-narrow">
          <Link href={`${ENERGY_BASE}/usage/`} className="we-back">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Energy usage
          </Link>
          <h1>Send a meter reading</h1>
          <ReadingForm energy={energy} update={update} />
        </div>
      )}
    </EnergyGate>
  );
}

function ReadingForm({ energy, update }: { energy: EnergyAccount; update: (energy: EnergyAccount) => void }) {
  const [reading, setReading] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const lastActual = energy.readings.find((item) => item.source !== "estimated");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    const result = await sendMeterReading(energy.username, reading);
    setSending(false);
    if (result.ok) {
      update(result.energy);
      setSent(Number(reading.replace(/\s/g, "")));
    } else {
      setError("errors" in result ? (result.errors.reading ?? "Check the reading and try again.") : "We couldn't send your reading. Check you are connected to the internet, then try again.");
    }
  };

  if (sent !== null) {
    return (
      <>
        <div className="we-confirmation" role="status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="we-confirmation__icon" />
          <p>
            Thank you. We have your reading of <strong>{sent}</strong>.
          </p>
        </div>
        <p>Your next bill will use this reading.</p>
        <div className="we-actions">
          <Link href={`${ENERGY_BASE}/usage/`} className="we-btn we-btn--primary">
            See my readings
          </Link>
          <button type="button" className="we-btn we-btn--secondary" onClick={() => { setSent(null); setReading(""); }}>
            Send another reading
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="we-lead">Regular readings mean your bills are based on what you really use, not on an estimate.</p>
      <dl className="we-details we-panel">
        <div>
          <dt>Meter serial number</dt>
          <dd>{energy.meterSerial}</dd>
        </div>
        {lastActual ? (
          <div>
            <dt>Last reading</dt>
            <dd>
              {lastActual.reading} on {formatDay(lastActual.readOn)}
            </dd>
          </div>
        ) : null}
      </dl>

      <form className="we-panel" onSubmit={submit} noValidate>
        <div className={`we-field ${error ? "has-error" : ""}`}>
          <label htmlFor="we-reading" className="we-label">
            Your meter reading
          </label>
          <p id="we-reading-hint" className="we-hint">
            Type the numbers on your meter from left to right. Leave out any numbers in red or after a decimal point.
          </p>
          {error ? (
            <p id="we-reading-error" className="we-error" role="alert">
              {error}
            </p>
          ) : null}
          <input
            id="we-reading"
            className="we-input we-input--narrow we-input--reading"
            value={reading}
            onChange={(event) => {
              setReading(event.target.value);
              setError("");
            }}
            inputMode="numeric"
            maxLength={8}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={`we-reading-hint${error ? " we-reading-error" : ""}`}
          />
        </div>
        <button type="submit" className="we-btn we-btn--primary" disabled={sending}>
          {sending ? "Sending…" : "Send reading"}
        </button>
      </form>
    </>
  );
}
