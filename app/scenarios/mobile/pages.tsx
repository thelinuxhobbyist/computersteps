"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { formatDay } from "../energy/energy-data";
import { formatMoney } from "../practice-bank/bank-data";
import { MOBILE, MOBILE_PLANS, MOBILE_TOPICS } from "../../../workers/practice-bank/src/shared/mobile";
import { changePlan, payMobile, sendMobileMessage } from "./mobile-api";
import { MobileGate, useMobileAccount } from "./useMobile";
import type { MobileAccount } from "../../../workers/practice-bank/src/shared/mobile-types";

function Bar({ used, total }: { used: number; total: number }) {
  const width = Math.max(4, Math.min(100, Math.round((used / total) * 100)));
  return (
    <div className="ps-bar" aria-hidden="true">
      <span style={{ width: `${width}%` }} />
    </div>
  );
}

export function MobileHome() {
  const state = useMobileAccount();
  return (
    <div className="ps-wrap">
      <div className="ps-hero">
        <div>
          <h1>Your mobile account, in one place</h1>
          <p>Check your allowance, read your bill, compare plans and ask for help. This is a practice network. Nothing here connects to a real phone company.</p>
          <div className="ps-actions">
            <Link className="ps-btn" href="/scenarios/mobile/account/">
              My account
            </Link>
            <Link className="ps-btn ps-btn--ghost" href="/scenarios/mobile/bill/">
              My bill
            </Link>
          </div>
        </div>
        <div className="ps-panel">
          <h2>Signed in</h2>
          {state.status === "ready" ? (
            <>
              <p>
                <strong>{state.mobile.fullName}</strong>
              </p>
              <p>{state.mobile.mobileNumber}</p>
              <p>
                {state.mobile.planName} · {state.mobile.usage.dataRemainingGb} GB left
              </p>
              <p>Amount to pay: {formatMoney(state.mobile.balancePence)}</p>
            </>
          ) : (
            <p>Sign in with your Computer Steps username to see your number, plan and bill.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileAccountPage() {
  return (
    <MobileGate>
      {(mobile) => (
        <div className="ps-wrap">
          <h1>My account</h1>
          <div className="ps-grid">
            <section className="ps-panel">
              <h2>{mobile.fullName}</h2>
              <p>Mobile number: {mobile.mobileNumber}</p>
              <p>Customer number: {mobile.customerNumber}</p>
              <p>
                Plan: {mobile.planName}, {formatMoney(mobile.monthlyPence)} a month
              </p>
              <p>
                {mobile.addressLine1}, {mobile.townOrCity}, {mobile.postcode}
              </p>
            </section>
            <section className="ps-panel">
              <h2>To pay</h2>
              <p>{formatMoney(mobile.balancePence)}</p>
              {mobile.balancePence > 0 ? <p className="ps-warn">Your latest bill is waiting for payment.</p> : <p className="ps-ok">Nothing to pay right now.</p>}
              <Link className="ps-btn" href="/scenarios/mobile/payments/">
                Payments
              </Link>
            </section>
          </div>
          {mobile.messages.length > 0 ? (
            <section>
              <h2>Support requests</h2>
              <ul>
                {mobile.messages.map((message) => (
                  <li key={message.id} className="ps-panel">
                    <strong>Reference {message.reference}</strong>
                    <p>{message.message}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </MobileGate>
  );
}

export function MobileUsagePage() {
  return (
    <MobileGate>
      {(mobile) => {
        const usage = mobile.usage;
        return (
          <div className="ps-wrap">
            <h1>My usage</h1>
            <p className="ps-muted">These figures stay the same until the allowance resets on {formatDay(usage.resetsOn)}.</p>
            <div className="ps-grid">
              <section className="ps-panel">
                <h2>Data</h2>
                <p>
                  {usage.dataRemainingGb} GB remaining of {usage.dataAllowanceGb} GB
                </p>
                <Bar used={usage.dataUsedGb} total={usage.dataAllowanceGb} />
                <p>{usage.dataUsedGb} GB used</p>
              </section>
              <section className="ps-panel">
                <h2>Calls</h2>
                <p>
                  {usage.minutesUsed} minutes used. Allowance: {usage.minutesAllowance}
                  {usage.minutesAllowance === "Unlimited" ? "" : " minutes"}
                </p>
              </section>
              <section className="ps-panel">
                <h2>Texts</h2>
                <p>
                  {usage.textsUsed} texts used. Allowance: {usage.textsAllowance}
                </p>
              </section>
            </div>
          </div>
        );
      }}
    </MobileGate>
  );
}

export function MobileBillPage() {
  return (
    <MobileGate>
      {(mobile) => (
        <div className="ps-wrap">
          <h1>My bill</h1>
          <table className="ps-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mobile.bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.periodLabel}</td>
                  <td>{formatDay(bill.dueOn)}</td>
                  <td>{formatMoney(bill.amountPence)}</td>
                  <td>{bill.status === "paid" ? "Paid" : "To pay"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MobileGate>
  );
}

export function MobilePlanPage() {
  return (
    <MobileGate>
      {(mobile, replace) => <PlanChooser mobile={mobile} replace={replace} />}
    </MobileGate>
  );
}

function PlanChooser({ mobile, replace }: { mobile: MobileAccount; replace: (mobile: MobileAccount) => void }) {
  const [chosen, setChosen] = useState(mobile.planId);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const result = await changePlan(mobile.username, chosen);
    setBusy(false);
    if (result.ok) {
      replace(result.mobile);
      setMessage(`Your plan is now ${result.mobile.planName}. The new price starts on the next bill. The current bill does not change.`);
    } else setMessage("We couldn't save the plan change. Try again.");
  };
  return (
    <div className="ps-wrap">
      <h1>My plan</h1>
      <p>You are on {mobile.planName}.</p>
      <div className="ps-grid">
        {MOBILE_PLANS.map((plan) => (
          <label key={plan.id} className="ps-panel">
            <input type="radio" name="plan" checked={chosen === plan.id} onChange={() => setChosen(plan.id)} /> <strong>{plan.name}</strong>
            <p>{formatMoney(plan.monthlyPence)} a month</p>
            <p>
              {plan.dataGb} GB data · {plan.minutes} minutes · {plan.texts} texts
            </p>
          </label>
        ))}
      </div>
      <p>Everyday has more data than Essential. Unlimited has the largest allowance.</p>
      {message ? <p className="ps-ok">{message}</p> : null}
      <button type="button" className="ps-btn" onClick={save} disabled={busy || chosen === mobile.planId}>
        {busy ? "Saving…" : "Confirm plan change"}
      </button>
    </div>
  );
}

export function MobilePaymentsPage() {
  return (
    <MobileGate>
      {(mobile, replace) => <Pay mobile={mobile} replace={replace} />}
    </MobileGate>
  );
}

function Pay({ mobile, replace }: { mobile: MobileAccount; replace: (mobile: MobileAccount) => void }) {
  const attempt = useRef<string | null>(null);
  const [done, setDone] = useState<{ reference: string; amountPence: number; balancePence: number | null } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    if (busy) return;
    if (!attempt.current) attempt.current = crypto.randomUUID();
    setBusy(true);
    const result = await payMobile(mobile.username, attempt.current);
    setBusy(false);
    if (result.ok) {
      replace(result.mobile);
      setDone(result);
      setError("");
      return;
    }
    if (result.reason === "insufficient-funds") {
      setError(`Practice Bank declined this payment. The balance is ${formatMoney(result.balancePence ?? 0)}.`);
      return;
    }
    setError("The bill was not paid. Try again. You will not be charged twice for this attempt.");
  };
  return (
    <div className="ps-wrap">
      <h1>Payments</h1>
      <p>This uses your Practice Bank balance. Westford Mobile does not ask for a card number.</p>
      {done ? (
        <p className="ps-ok">
          Payment received. You paid {formatMoney(done.amountPence)}. Reference <strong>{done.reference}</strong>.
          {done.balancePence !== null ? ` Practice Bank balance: ${formatMoney(done.balancePence)}.` : ""}
        </p>
      ) : null}
      {error ? <p className="ps-error">{error}</p> : null}
      {mobile.balancePence > 0 && !done ? (
        <button type="button" className="ps-btn ps-btn--accent" onClick={pay} disabled={busy}>
          {busy ? "Paying…" : `Pay ${formatMoney(mobile.balancePence)}`}
        </button>
      ) : null}
      <h2>Previous payments</h2>
      {mobile.payments.length === 0 ? <p>No payments yet.</p> : (
        <ul>
          {mobile.payments.map((payment) => (
            <li key={payment.id}>
              {formatMoney(payment.amountPence)} · {payment.reference}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MobileHelpPage() {
  return (
    <div className="ps-wrap">
      <h1>Help and support</h1>
      <div className="ps-grid">
        <section className="ps-panel">
          <h2>No mobile internet</h2>
          <p>Turn the phone off and on, then check you are not in flight mode. If it still fails, send a message from Contact Us and keep the reference number.</p>
        </section>
        <section className="ps-panel">
          <h2>Reading your bill</h2>
          <p>The amount to pay and the due date are on My Bill. Paying updates Practice Bank as well as this account.</p>
        </section>
        <section className="ps-panel">
          <h2>Contact</h2>
          <p>Phone {MOBILE.phone}. Email {MOBILE.email}. That address is fictional and does not receive messages.</p>
          <Link href="/scenarios/mobile/contact/">Contact us</Link>
        </section>
      </div>
    </div>
  );
}

export function MobileContactPage() {
  return (
    <MobileGate>
      {(mobile, replace) => <Contact mobile={mobile} replace={replace} />}
    </MobileGate>
  );
}

function Contact({ mobile, replace }: { mobile: MobileAccount; replace: (mobile: MobileAccount) => void }) {
  const [topic, setTopic] = useState("internet");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const result = await sendMobileMessage(mobile.username, topic, message);
    setBusy(false);
    if (result.ok) {
      replace(result.mobile);
      setReference(result.reference);
      setError("");
      setMessage("");
      return;
    }
    setError(result.errors.message || result.errors.topic || "Check the form and try again.");
  };
  return (
    <div className="ps-wrap">
      <h1>Contact us</h1>
      {reference ? <p className="ps-ok">Message saved. Reference <strong>{reference}</strong>. No email has been sent.</p> : null}
      <form className="ps-panel" onSubmit={submit} noValidate>
        {error ? <p className="ps-error">{error}</p> : null}
        <div className="ps-field">
          <label htmlFor="wm-topic">Topic</label>
          <select id="wm-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
            {MOBILE_TOPICS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ps-field">
          <label htmlFor="wm-message">Message</label>
          <textarea id="wm-message" value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
        <button className="ps-btn" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
