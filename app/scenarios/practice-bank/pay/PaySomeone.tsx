"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import AccountGate from "../components/AccountGate";
import AddMoney from "../components/AddMoney";
import { request } from "../bank-api";
import { BANK_BASE, formatMoney, type BankAccount } from "../bank-data";

type Fields = { payeeName: string; sortCode: string; accountNumber: string; reference: string; amount: string };
type Errors = Partial<Record<keyof Fields | "amountPence", string>>;

const LABELS: Record<keyof Fields, string> = {
  payeeName: "Name of the person or company",
  sortCode: "Sort code",
  accountNumber: "Account number",
  reference: "Reference",
  amount: "Amount",
};

const EMPTY: Fields = { payeeName: "", sortCode: "", accountNumber: "", reference: "", amount: "" };

function readPounds(value: string): number | null {
  const cleaned = value.replace(/[£,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const pence = Math.round(Number(cleaned) * 100);
  return pence > 0 ? pence : null;
}

export default function PaySomeone() {
  return <AccountGate>{(account, refresh) => <PayForm account={account} refresh={refresh} />}</AccountGate>;
}

function PayForm({ account, refresh }: { account: BankAccount; refresh: () => void }) {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [stage, setStage] = useState<"form" | "check" | "done">("form");
  const [problem, setProblem] = useState("");
  const [sending, setSending] = useState(false);
  const [paid, setPaid] = useState<{ amountPence: number; payeeName: string; balancePence: number | null } | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const attempt = useRef<{ amountPence: number; key: string } | null>(null);

  const change = (name: keyof Fields, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, ...(name === "amount" ? { amountPence: undefined } : {}) }));
  };

  const showErrors = (next: Errors, nextProblem = "") => {
    setErrors(next);
    setProblem(nextProblem);
    setStage("form");
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const review = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (!values.payeeName.trim()) next.payeeName = "Type the name of the person or company you are paying.";
    if (values.sortCode.replace(/\D/g, "").length !== 6) next.sortCode = "A sort code has 6 numbers, like 00-12-34.";
    if (values.accountNumber.replace(/\D/g, "").length !== 8) next.accountNumber = "An account number has 8 numbers.";
    if (!values.reference.trim()) next.reference = "Add a reference so they know the payment is from you.";
    const amountPence = readPounds(values.amount);
    if (amountPence === null) next.amount = "Type how much to pay, like 25.00.";
    else if (amountPence > account.balancePence) next.amount = `You only have ${formatMoney(account.balancePence)} in your account.`;
    if (Object.keys(next).length > 0) {
      showErrors(next);
      return;
    }
    setProblem("");
    setStage("check");
  };

  const send = async () => {
    const amountPence = readPounds(values.amount);
    if (amountPence === null || sending) return;
    if (!attempt.current || attempt.current.amountPence !== amountPence) {
      attempt.current = { amountPence, key: crypto.randomUUID() };
    }
    setSending(true);
    const result = await request(`/accounts/${encodeURIComponent(account.username)}/transfers`, {
      method: "POST",
      body: JSON.stringify({ ...values, amountPence, idempotencyKey: attempt.current.key }),
    });
    setSending(false);

    if (result?.status === 200) {
      setPaid({ amountPence, payeeName: values.payeeName.trim(), balancePence: typeof result.body.balancePence === "number" ? result.body.balancePence : null });
      setStage("done");
      refresh();
    } else if (result?.status === 400 && result.body.errors) {
      const fromServer = result.body.errors as Errors;
      showErrors({ ...fromServer, amount: fromServer.amount ?? fromServer.amountPence });
    } else if (result?.status === 402) {
      showErrors({}, "There is not enough money in your account to make this payment.");
    } else {
      showErrors({}, "We couldn't send your payment. Check you are connected to the internet, then try again.");
    }
  };

  if (stage === "done" && paid) {
    return (
      <div className="pb-wrap pb-content pb-narrow">
        <div className="pb-confirmation" role="status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="pb-confirmation__icon" />
          <div>
            <h1>Payment sent</h1>
            <p>
              You paid <strong>{formatMoney(paid.amountPence)}</strong> to <strong>{paid.payeeName}</strong>.
            </p>
            {paid.balancePence !== null ? <p>Your balance is now {formatMoney(paid.balancePence)}.</p> : null}
          </div>
        </div>
        <div className="pb-actions">
          <Link href={`${BANK_BASE}/account/`} className="pb-btn pb-btn--primary">
            Back to my account
          </Link>
          <button
            type="button"
            className="pb-btn pb-btn--secondary"
            onClick={() => {
              setValues(EMPTY);
              setPaid(null);
              setStage("form");
            }}
          >
            Make another payment
          </button>
        </div>
      </div>
    );
  }

  if (stage === "check") {
    return (
      <div className="pb-wrap pb-content pb-narrow">
        <h1>Check your payment</h1>
        <p className="pb-lead">Make sure everything is right. Money sent to the wrong account can be hard to get back.</p>
        <section className="pb-panel">
          <dl className="pb-details pb-details--large">
            <div>
              <dt>Paying</dt>
              <dd>{values.payeeName.trim()}</dd>
            </div>
            <div>
              <dt>Sort code</dt>
              <dd>{values.sortCode}</dd>
            </div>
            <div>
              <dt>Account number</dt>
              <dd>{values.accountNumber}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{values.reference}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatMoney(readPounds(values.amount) ?? 0)}</dd>
            </div>
          </dl>
          <div className="pb-actions">
            <button type="button" className="pb-btn pb-btn--primary" onClick={send} disabled={sending}>
              {sending ? "Sending…" : "Confirm and pay"}
            </button>
            <button type="button" className="pb-btn pb-btn--secondary" onClick={() => setStage("form")} disabled={sending}>
              Change details
            </button>
          </div>
        </section>
      </div>
    );
  }

  const errorNames = (Object.keys(LABELS) as (keyof Fields)[]).filter((name) => errors[name]);
  const field = (name: keyof Fields, options: { hint?: string; inputMode?: "numeric" | "decimal"; maxLength?: number; medium?: boolean } = {}) => {
    const id = `pb-pay-${name}`;
    const describedBy = [options.hint ? `${id}-hint` : "", errors[name] ? `${id}-error` : ""].filter(Boolean).join(" ");
    return (
      <div className={`pb-field ${errors[name] ? "has-error" : ""}`}>
        <label htmlFor={id} className="pb-label">
          {LABELS[name]}
        </label>
        {options.hint ? (
          <p id={`${id}-hint`} className="pb-hint">
            {options.hint}
          </p>
        ) : null}
        {errors[name] ? (
          <p id={`${id}-error`} className="pb-error">
            {errors[name]}
          </p>
        ) : null}
        <input
          id={id}
          className={`pb-input ${options.medium ? "pb-input--medium" : ""}`}
          value={values[name]}
          onChange={(event) => change(name, event.target.value)}
          inputMode={options.inputMode}
          maxLength={options.maxLength}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
      </div>
    );
  };

  return (
    <div className="pb-wrap pb-content pb-narrow">
      <h1>Transfer money</h1>
      <p className="pb-lead">
        You have <strong>{formatMoney(account.balancePence)}</strong> available. Money you send leaves your account straight away.
      </p>

      <section className="pb-panel" aria-labelledby="pb-receive-heading">
        <h2 id="pb-receive-heading">Receiving money</h2>
        <p>Give these details to anyone who needs to pay you by bank transfer.</p>
        <dl className="pb-details">
          <div>
            <dt>Account name</dt>
            <dd>{account.fullName}</dd>
          </div>
          <div>
            <dt>Sort code</dt>
            <dd>{account.sortCode}</dd>
          </div>
          <div>
            <dt>Account number</dt>
            <dd>{account.accountNumber}</dd>
          </div>
        </dl>
        <p>Need more pretend money for a bill? You can add £500 whenever you like.</p>
        <AddMoney username={account.username} onDone={refresh} />
      </section>

      <h2>Send money</h2>
      <p>Copy the name, sort code, account number and reference from the company you are paying. Westford Energy shows these on its website and on your bill.</p>

      <form className="pb-panel" onSubmit={review} noValidate>
        {problem || errorNames.length > 0 ? (
          <div className="pb-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
            <h2>{problem ? "Your payment was not sent" : "Please check your payment"}</h2>
            {problem ? (
              <p>{problem}</p>
            ) : (
              <ul>
                {errorNames.map((name) => (
                  <li key={name}>
                    <a href={`#pb-pay-${name}`}>{LABELS[name]}</a>: {errors[name]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {field("payeeName", { hint: "Exactly as the company asks you to write it." })}
        {field("sortCode", { hint: "6 numbers, like 00-12-34.", inputMode: "numeric", maxLength: 8, medium: true })}
        {field("accountNumber", { hint: "8 numbers.", inputMode: "numeric", maxLength: 8, medium: true })}
        {field("reference", { hint: "The company will tell you what to use, often your account or customer number.", maxLength: 18, medium: true })}
        {field("amount", { hint: "In pounds, like 25.00.", inputMode: "decimal", medium: true })}

        <button type="submit" className="pb-btn pb-btn--primary">
          Continue
        </button>
      </form>

      <div className="pb-tip" role="note">
        <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" className="pb-tip__icon" />
        <p>
          <strong>Stay safe:</strong> only pay bank details you have found yourself, for example on a company&rsquo;s own website or bill.
          If someone contacts you asking for money to be sent to a new account, it could be a scam.
        </p>
      </div>
    </div>
  );
}
