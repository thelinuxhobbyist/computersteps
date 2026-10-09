"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../../components/EnergyGate";
import { cancelDirectDebit, setUpDirectDebit, type FieldErrors } from "../../energy-api";
import { DIRECT_DEBIT_FIRST_DAY, DIRECT_DEBIT_LAST_DAY, ENERGY_BASE, dayOf, formatDay, ordinal, type EnergyAccount } from "../../energy-data";

const DAYS = Array.from({ length: DIRECT_DEBIT_LAST_DAY - DIRECT_DEBIT_FIRST_DAY + 1 }, (_, index) => DIRECT_DEBIT_FIRST_DAY + index);

const LABELS: Record<string, string> = {
  accountName: "Name of the account holder",
  sortCode: "Sort code",
  accountNumber: "Account number",
  day: "Payment date",
  confirm: "Confirm",
};

export default function DirectDebit() {
  return (
    <EnergyGate>
      {(energy, update) => (
        <div className="we-wrap we-content we-narrow">
          <Link href={`${ENERGY_BASE}/payments/`} className="we-back">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Payments
          </Link>
          <h1>Direct Debit</h1>
          {energy.directDebit ? <Manage energy={energy} update={update} /> : <SetUp energy={energy} update={update} />}
        </div>
      )}
    </EnergyGate>
  );
}

function Manage({ energy, update }: { energy: EnergyAccount; update: (energy: EnergyAccount) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(false);
  const directDebit = energy.directDebit!;

  const cancel = async () => {
    setWorking(true);
    const result = await cancelDirectDebit(energy.username);
    setWorking(false);
    if (result.ok) update(result.energy);
    else setFailed(true);
  };

  return (
    <>
      <div className="we-confirmation" role="status">
        <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="we-confirmation__icon" />
        <p>Your Direct Debit is set up.</p>
      </div>
      <dl className="we-details we-panel">
        <div>
          <dt>Account holder</dt>
          <dd>{directDebit.accountName}</dd>
        </div>
        <div>
          <dt>Bank account</dt>
          <dd>
            Sort code {directDebit.sortCode}, account ending {directDebit.accountNumberEnding}
          </dd>
        </div>
        <div>
          <dt>Payment date</dt>
          <dd>The {ordinal(directDebit.day)} of each month</dd>
        </div>
        <div>
          <dt>Set up on</dt>
          <dd>{formatDay(dayOf(directDebit.setUpAt))}</dd>
        </div>
      </dl>
      <p className="we-note">Each month we will take the amount of your latest bill. We will tell you the amount at least 10 days before.</p>

      <section className="we-section" aria-labelledby="we-cancel-heading">
        <h2 id="we-cancel-heading">Cancel your Direct Debit</h2>
        {failed ? (
          <p className="we-error" role="alert">
            We couldn&rsquo;t cancel your Direct Debit. Check you are connected to the internet, then try again.
          </p>
        ) : null}
        {confirming ? (
          <div className="we-panel we-panel--warning">
            <p>
              <strong>Are you sure?</strong> If you cancel, you will need to pay each bill yourself.
            </p>
            <div className="we-actions">
              <button type="button" className="we-btn we-btn--danger" onClick={cancel} disabled={working}>
                {working ? "Cancelling…" : "Yes, cancel my Direct Debit"}
              </button>
              <button type="button" className="we-btn we-btn--secondary" onClick={() => setConfirming(false)}>
                No, keep it
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="we-btn we-btn--secondary" onClick={() => setConfirming(true)}>
            Cancel Direct Debit
          </button>
        )}
      </section>
    </>
  );
}

function SetUp({ energy, update }: { energy: EnergyAccount; update: (energy: EnergyAccount) => void }) {
  const [values, setValues] = useState({ accountName: "", sortCode: "", accountNumber: "", day: "", confirm: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState("");
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const change = (name: keyof typeof values, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const result = await setUpDirectDebit(energy.username, {
      accountName: values.accountName,
      sortCode: values.sortCode,
      accountNumber: values.accountNumber,
      day: Number(values.day),
      confirm: values.confirm,
    });
    setSaving(false);
    if (result.ok) {
      update(result.energy);
      return;
    }
    if ("errors" in result) {
      setErrors(result.errors);
      setProblem("");
    } else {
      setProblem("We couldn't set up your Direct Debit. Check you are connected to the internet, then try again.");
    }
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const errorNames = Object.keys(LABELS).filter((name) => errors[name]);
  const textField = (name: "accountName" | "sortCode" | "accountNumber", hint: string, options: { inputMode?: "numeric"; maxLength?: number; narrow?: boolean } = {}) => (
    <div className={`we-field ${errors[name] ? "has-error" : ""} ${options.narrow ? "we-field--narrow" : ""}`}>
      <label htmlFor={`we-dd-${name}`} className="we-label">
        {LABELS[name]}
      </label>
      <p id={`we-dd-${name}-hint`} className="we-hint">
        {hint}
      </p>
      {errors[name] ? (
        <p id={`we-dd-${name}-error`} className="we-error">
          {errors[name]}
        </p>
      ) : null}
      <input
        id={`we-dd-${name}`}
        className="we-input"
        value={values[name]}
        onChange={(event) => change(name, event.target.value)}
        inputMode={options.inputMode}
        maxLength={options.maxLength}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={`we-dd-${name}-hint${errors[name] ? ` we-dd-${name}-error` : ""}`}
      />
    </div>
  );

  return (
    <>
      <p className="we-lead">
        With a Direct Debit, your bill is paid from your bank account automatically each month, so you never pay late.
      </p>
      <form className="we-panel" onSubmit={submit} noValidate>
        {problem || errorNames.length > 0 ? (
          <div className="we-errors" role="alert" tabIndex={-1} ref={summaryRef}>
            <h2>{problem ? "Something went wrong" : "Please check your details"}</h2>
            {problem ? (
              <p>{problem}</p>
            ) : (
              <ul>
                {errorNames.map((name) => (
                  <li key={name}>
                    <a href={`#we-dd-${name}`}>{LABELS[name]}</a>: {errors[name]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <fieldset className="we-fieldset">
          <legend>Your bank details</legend>
          {textField("accountName", "The name on the bank account.")}
          {textField("sortCode", "6 numbers, like 00-12-34.", { inputMode: "numeric", maxLength: 8, narrow: true })}
          {textField("accountNumber", "8 numbers.", { inputMode: "numeric", maxLength: 8, narrow: true })}
        </fieldset>

        <div className={`we-field ${errors.day ? "has-error" : ""}`}>
          <label htmlFor="we-dd-day" className="we-label">
            {LABELS.day}
          </label>
          <p id="we-dd-day-hint" className="we-hint">
            Which day of the month should we take the payment?
          </p>
          {errors.day ? (
            <p id="we-dd-day-error" className="we-error">
              {errors.day}
            </p>
          ) : null}
          <select
            id="we-dd-day"
            className="we-input we-input--narrow"
            value={values.day}
            onChange={(event) => change("day", event.target.value)}
            aria-describedby={`we-dd-day-hint${errors.day ? " we-dd-day-error" : ""}`}
          >
            <option value="">Choose a day</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {ordinal(day)} of the month
              </option>
            ))}
          </select>
        </div>

        <div className={`we-field ${errors.confirm ? "has-error" : ""}`}>
          {errors.confirm ? (
            <p id="we-dd-confirm-error" className="we-error">
              {errors.confirm}
            </p>
          ) : null}
          <div className="we-checkbox">
            <input id="we-dd-confirm" type="checkbox" checked={values.confirm} onChange={(event) => change("confirm", event.target.checked)} />
            <label htmlFor="we-dd-confirm">I am the account holder and I am allowed to set up Direct Debits from this account.</label>
          </div>
        </div>

        <button type="submit" className="we-btn we-btn--primary" disabled={saving}>
          {saving ? "Setting up…" : "Set up Direct Debit"}
        </button>
      </form>
      <p className="we-note">
        Direct Debits are protected by the Direct Debit Guarantee. If a payment is taken by mistake, your bank will give it back.
      </p>
    </>
  );
}
