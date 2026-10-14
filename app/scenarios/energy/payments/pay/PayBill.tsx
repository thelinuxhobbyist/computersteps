"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../../components/EnergyGate";
import { formatCardNumberInput, formatCvvInput, formatExpiryInput } from "../../../../shop/shop-data";
import { BANK_BASE, formatMoney } from "../../../practice-bank/bank-data";
import { payByCard, type CardFields, type FieldErrors } from "../../energy-api";
import { ENERGY_BASE, poundsInput, readPounds, type EnergyAccount } from "../../energy-data";

type Fields = CardFields & { amount: string };
type Done = { amountPence: number; reference: string; balancePence: number | null };

const LABELS: Record<keyof Fields, string> = {
  amount: "Amount to pay",
  nameOnCard: "Name on card",
  cardNumber: "Card number",
  expiry: "Expiry date (MM/YY)",
  cvv: "Security code",
};

export default function PayBill() {
  return <EnergyGate>{(energy, update) => <PayForm energy={energy} update={update} />}</EnergyGate>;
}

function PayForm({ energy, update }: { energy: EnergyAccount; update: (energy: EnergyAccount) => void }) {
  const [values, setValues] = useState<Fields>({
    amount: energy.balancePence > 0 ? poundsInput(energy.balancePence) : "",
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const attempt = useRef<{ amountPence: number; key: string } | null>(null);

  const change = (name: keyof Fields, raw: string) => {
    const value =
      name === "cardNumber" ? formatCardNumberInput(raw) : name === "expiry" ? formatExpiryInput(raw, values.expiry) : name === "cvv" ? formatCvvInput(raw) : raw;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const show = (nextErrors: FieldErrors, nextProblem = "") => {
    setErrors(nextErrors);
    setProblem(nextProblem);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (paying) return;
    const amountPence = readPounds(values.amount);
    const nextErrors: FieldErrors = {};
    if (amountPence === null) nextErrors.amount = "Type an amount in pounds and pence, like 84.50.";
    else if (amountPence > Math.max(energy.balancePence, 0)) nextErrors.amount = `You can pay up to ${formatMoney(Math.max(energy.balancePence, 0))}, the amount you owe.`;
    if (!values.nameOnCard.trim()) nextErrors.nameOnCard = "Type the name exactly as it is on the card.";
    if (values.cardNumber.replace(/\D/g, "").length !== 16) nextErrors.cardNumber = "The card number is the 16 numbers on the front of the card.";
    if (!/^\d{2}\/\d{2}$/.test(values.expiry)) nextErrors.expiry = "Type the expiry date like 08/29.";
    if (!/^\d{3}$/.test(values.cvv)) nextErrors.cvv = "The security code is the 3 numbers on the back of the card.";
    if (Object.keys(nextErrors).length > 0 || amountPence === null) {
      show(nextErrors);
      return;
    }

    if (!attempt.current || attempt.current.amountPence !== amountPence) {
      attempt.current = { amountPence, key: crypto.randomUUID() };
    }
    setPaying(true);
    const result = await payByCard(energy.username, values, amountPence, attempt.current.key);
    setPaying(false);

    if (result.ok) {
      update(result.energy);
      setDone({ amountPence: result.amountPence, reference: result.reference, balancePence: result.balancePence });
      return;
    }
    if (result.reason === "card-details") show(result.errors);
    else if (result.reason === "card-not-found") show({ cardNumber: "We don't recognise this card number. Check each group of 4 numbers." });
    else if (result.reason === "not-your-card") show({ cardNumber: `This card is not in ${energy.fullName}'s name. Use the card from ${energy.fullName}'s Practice Bank account.` });
    else if (result.reason === "insufficient-funds") show({}, "Your bank declined this payment because there is not enough money in the account. Try a smaller amount.");
    else show({}, "We couldn't take the payment. Check you are connected to the internet, then try again.");
  };

  if (done) {
    return (
      <div className="we-wrap we-content we-narrow">
        <div className="we-confirmation" role="status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="we-confirmation__icon" />
          <h1>Payment received</h1>
          <p>
            Thank you. You paid <strong>{formatMoney(done.amountPence)}</strong>.
          </p>
        </div>
        <dl className="we-details we-panel">
          <div>
            <dt>Payment reference</dt>
            <dd>{done.reference}</dd>
          </div>
          <div>
            <dt>Left to pay</dt>
            <dd>{formatMoney(Math.max(energy.balancePence, 0))}</dd>
          </div>
        </dl>
        <p className="we-note">The money will show in your bank account as a payment to Westford Energy.</p>
        <div className="we-actions">
          <Link href={`${ENERGY_BASE}/account/`} className="we-btn we-btn--primary">
            Back to my account
          </Link>
          <Link href={`${ENERGY_BASE}/payments/history/`} className="we-btn we-btn--secondary">
            See my payments
          </Link>
        </div>
      </div>
    );
  }

  if (energy.balancePence <= 0) {
    return (
      <div className="we-wrap we-content we-narrow">
        <h1>Pay online</h1>
        <div className="we-panel">
          <p>You have nothing to pay at the moment.</p>
          <Link href={`${ENERGY_BASE}/account/`} className="we-btn we-btn--primary">
            Back to my account
          </Link>
        </div>
      </div>
    );
  }

  const errorNames = (Object.keys(LABELS) as (keyof Fields)[]).filter((name) => errors[name]);
  const field = (name: keyof Fields, options: { hint?: string; inputMode?: "numeric" | "decimal"; maxLength?: number; narrow?: boolean; prefix?: string } = {}) => {
    const id = `we-pay-${name}`;
    return (
      <div className={`we-field ${errors[name] ? "has-error" : ""} ${options.narrow ? "we-field--narrow" : ""}`}>
        <label htmlFor={id} className="we-label">
          {LABELS[name]}
        </label>
        {options.hint ? (
          <p id={`${id}-hint`} className="we-hint">
            {options.hint}
          </p>
        ) : null}
        {errors[name] ? (
          <p id={`${id}-error`} className="we-error">
            {errors[name]}
          </p>
        ) : null}
        <div className={options.prefix ? "we-input-prefix" : undefined}>
          {options.prefix ? <span aria-hidden="true">{options.prefix}</span> : null}
          <input
            id={id}
            className="we-input"
            value={values[name]}
            onChange={(event) => change(name, event.target.value)}
            inputMode={options.inputMode}
            maxLength={options.maxLength}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={errors[name] ? true : undefined}
            aria-describedby={[options.hint ? `${id}-hint` : "", errors[name] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="we-wrap we-content we-narrow">
      <Link href={`${ENERGY_BASE}/payments/`} className="we-back">
        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Payments
      </Link>
      <h1>Pay online</h1>
      <p className="we-lead">
        You owe <strong>{formatMoney(energy.balancePence)}</strong>. You can pay it all, or part of it.
      </p>

      <form className="we-panel" onSubmit={submit} noValidate>
        {problem ? (
          <div className="we-errors" role="alert" tabIndex={-1} ref={summaryRef}>
            <h2>Your payment did not go through</h2>
            <p>{problem}</p>
          </div>
        ) : errorNames.length > 0 ? (
          <div className="we-errors" role="alert" tabIndex={-1} ref={summaryRef}>
            <h2>Please check {errorNames.length === 1 ? "1 thing" : `${errorNames.length} things`}</h2>
            <ul>
              {errorNames.map((name) => (
                <li key={name}>
                  <a href={`#we-pay-${name}`}>{LABELS[name]}</a>: {errors[name]}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {field("amount", { hint: "In pounds and pence.", inputMode: "decimal", narrow: true, prefix: "£" })}

        <fieldset className="we-fieldset">
          <legend>Debit card details</legend>
          <p className="we-hint">
            Type the details exactly as they are on the card. Practice cards are in{" "}
            <Link href={`${BANK_BASE}/card/`} className="we-link">
              Practice Bank under My card
            </Link>
            .
          </p>
          {field("nameOnCard")}
          {field("cardNumber", { hint: "The 16 numbers on the front of the card.", inputMode: "numeric", maxLength: 19 })}
          <div className="we-row">
            {field("expiry", { inputMode: "numeric", maxLength: 5, narrow: true })}
            {field("cvv", { hint: "3 numbers on the back.", inputMode: "numeric", maxLength: 3, narrow: true })}
          </div>
        </fieldset>

        <button type="submit" className="we-btn we-btn--primary" disabled={paying}>
          <FontAwesomeIcon icon={faLock} aria-hidden="true" /> {paying ? "Taking payment…" : "Pay now"}
        </button>
      </form>
    </div>
  );
}
