"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { setLearner, useLearner } from "../../lib/learner-session";
import { formatDay } from "../energy/energy-data";
import { getAccount } from "../practice-bank/bank-api";
import { BANK_BASE } from "../practice-bank/bank-data";
import { ACTION_LABELS, COLLECTION_POINT, findParcel, type DeliveryAction } from "../../../workers/practice-bank/src/shared/deliveries";
import { getDeliveries, saveDelivery, type DeliveryIdentity, type DeliveryRequest } from "./delivery-api";

export function TrackHome() {
  return (
    <Suspense fallback={<p className="ps-wrap">Loading tracking…</p>}>
      <TrackForm />
    </Suspense>
  );
}

function TrackForm() {
  const params = useSearchParams();
  const initial = params.get("code") ?? "";
  const [code, setCode] = useState(initial);
  const [error, setError] = useState("");
  const [found, setFound] = useState<string | null>(findParcel(initial)?.code ?? null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parcel = findParcel(code);
    if (!code.trim()) {
      setError("Type a tracking code. You can find it on the delivery label or in the practice instructions.");
      setFound(null);
      return;
    }
    if (!parcel) {
      setError("We can't find that tracking code. Check each letter and number. Practice codes look like WF48271936.");
      setFound(null);
      return;
    }
    setError("");
    setFound(parcel.code);
  };
  return (
    <div className="ps-wrap">
      <div className="ps-hero">
        <div>
          <h1>Track a parcel</h1>
          <p>Type the tracking code from the label or from your practice task. Example: WF48271936.</p>
          <form className="ps-panel" onSubmit={submit} noValidate>
            <div className="ps-field">
              <label htmlFor="wd-code">Tracking code</label>
              <input id="wd-code" value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" />
            </div>
            {error ? <p className="ps-error">{error}</p> : null}
            <button className="ps-btn ps-btn--accent" type="submit">
              Track
            </button>
          </form>
        </div>
        <div className="ps-panel">
          <h2>Where to find a code</h2>
          <p>On a real label it is often under a barcode. Here, use one of the practice codes in your task, such as WF48271936, WF19384720 or WF55019283.</p>
        </div>
      </div>
      {found ? <ParcelResult code={found} /> : null}
    </div>
  );
}

function ParcelResult({ code }: { code: string }) {
  const parcel = findParcel(code);
  const username = useLearner();
  const [identity, setIdentity] = useState<DeliveryIdentity | null>(null);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [action, setAction] = useState<DeliveryAction | "">("");
  const [detail, setDetail] = useState("");
  const [reference, setReference] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [signIn, setSignIn] = useState("");

  useEffect(() => {
    if (!username) return;
    getDeliveries(username).then((result) => {
      if (result.status === "ready") {
        setIdentity(result.identity);
        setRequests(result.requests.filter((item) => item.trackingCode === code));
      }
    });
  }, [username, code]);

  if (!parcel) return null;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!username) {
      setProblem("Sign in with your Computer Steps username before saving a delivery change.");
      return;
    }
    if (!action) {
      setProblem("Choose what you want to change.");
      return;
    }
    setBusy(true);
    const result = await saveDelivery(username, { trackingCode: parcel.code, action, detail: action === "collection_point" ? COLLECTION_POINT.address : detail });
    setBusy(false);
    if (result.ok) {
      setReference(result.reference);
      setRequests(result.requests.filter((item) => item.trackingCode === parcel.code));
      setProblem("");
      return;
    }
    setProblem(result.message);
  };

  const sign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await getAccount(signIn.trim());
    if (result.status === "ready") setLearner(result.account.username);
    else setProblem("We can't find that username. Open a Practice Bank account if you don't have one.");
  };

  return (
    <section className="ps-panel" style={{ marginTop: 20 }} aria-live="polite">
      <h2>Tracking result {parcel.code}</h2>
      <p>
        <strong>Status:</strong> {parcel.statusLabel}
      </p>
      <p>{parcel.note}</p>
      {parcel.estimatedDelivery ? (
        <p>
          <strong>Estimated delivery:</strong> {formatDay(parcel.estimatedDelivery)}
        </p>
      ) : null}
      <p>
        <strong>Recipient:</strong> {identity ? identity.fullName : "Sign in to see the name on your Computer Steps account"}
      </p>
      <p>
        <strong>Address:</strong>{" "}
        {identity ? `${identity.addressLine1}, ${identity.townOrCity}, ${identity.postcode}` : "The address is saved on your practice account."}
      </p>
      <h3>History</h3>
      <ol>
        {parcel.history.map((item) => (
          <li key={item.label}>
            {formatDay(item.at)} — {item.label}
          </li>
        ))}
      </ol>
      {parcel.actions.length === 0 ? <p>This parcel has been delivered, so delivery options are closed.</p> : null}
      {parcel.actions.includes("collection_point") ? (
        <p>
          Collection point: {COLLECTION_POINT.name}, {COLLECTION_POINT.address}. {COLLECTION_POINT.hours}
        </p>
      ) : null}
      {reference ? <p className="ps-ok">Saved. Confirmation reference <strong>{reference}</strong>.</p> : null}
      {problem ? <p className="ps-error">{problem}</p> : null}
      {!username ? (
        <form onSubmit={sign}>
          <div className="ps-field">
            <label htmlFor="wd-user">Computer Steps username</label>
            <input id="wd-user" value={signIn} onChange={(event) => setSignIn(event.target.value)} />
          </div>
          <button className="ps-btn" type="submit">
            Sign in to save a change
          </button>
          <p>
            <Link href={`${BANK_BASE}/open-account/`}>Open a Practice Bank account</Link>
          </p>
        </form>
      ) : parcel.actions.length > 0 ? (
        <form onSubmit={save}>
          <div className="ps-field">
            <label htmlFor="wd-action">What do you want to do?</label>
            <select id="wd-action" value={action} onChange={(event) => setAction(event.target.value as DeliveryAction)}>
              <option value="">Choose an option</option>
              {parcel.actions.map((item) => (
                <option key={item} value={item}>
                  {ACTION_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          {action === "change_date" ? (
            <div className="ps-field">
              <label htmlFor="wd-date">New date</label>
              <select id="wd-date" value={detail} onChange={(event) => setDetail(event.target.value)}>
                <option value="">Choose a date</option>
                {parcel.dateOptions.map((day) => (
                  <option key={day} value={day}>
                    {formatDay(day)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {action && action !== "change_date" && action !== "collection_point" ? (
            <div className="ps-field">
              <label htmlFor="wd-detail">Details</label>
              <textarea id="wd-detail" value={detail} onChange={(event) => setDetail(event.target.value)} />
            </div>
          ) : null}
          <button className="ps-btn ps-btn--accent" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </form>
      ) : null}
      {requests.length > 0 ? (
        <>
          <h3>Saved for this parcel</h3>
          <ul>
            {requests.map((item) => (
              <li key={item.id}>
                {item.detail} — {item.reference}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function MyDeliveries() {
  const username = useLearner();
  const [requests, setRequests] = useState<DeliveryRequest[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!username) return;
    getDeliveries(username).then((result) => {
      if (result.status === "ready") setRequests(result.requests);
    });
  }, [username]);
  const sign = async (event: FormEvent) => {
    event.preventDefault();
    const result = await getAccount(name.trim());
    if (result.status === "ready") setLearner(result.account.username);
    else setError("We can't find that username.");
  };
  if (!username) {
    return (
      <div className="ps-wrap">
        <h1>My deliveries</h1>
        <form className="ps-panel" onSubmit={sign}>
          {error ? <p className="ps-error">{error}</p> : null}
          <div className="ps-field">
            <label htmlFor="wd-name">Username</label>
            <input id="wd-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <button className="ps-btn" type="submit">
            Sign in
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="ps-wrap">
      <h1>My deliveries</h1>
      {!requests || requests.length === 0 ? <p>You have not saved a delivery change yet. Track a parcel first.</p> : null}
      <ul>
        {(requests ?? []).map((item) => (
          <li key={item.id} className="ps-panel">
            <strong>{item.trackingCode}</strong>
            <p>{item.detail}</p>
            <p>Reference {item.reference}</p>
            <Link href={`/scenarios/deliveries/?code=${item.trackingCode}`}>Open tracking</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DeliveryHelp() {
  const username = useLearner();
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username) {
      setError("Sign in before sending a message.");
      return;
    }
    const result = await saveDelivery(username, { action: "support", detail: message });
    if (result.ok) setReference(result.reference);
    else setError(result.message);
  };
  return (
    <div className="ps-wrap">
      <h1>Help</h1>
      <ul>
        <li>Label created — the sender has printed a label. We do not have the parcel yet.</li>
        <li>Parcel received — it is at a depot.</li>
        <li>In transit — it is moving between depots.</li>
        <li>Out for delivery — a driver has it today.</li>
        <li>Delivery attempted — we tried, but could not leave it.</li>
        <li>Delivered — the parcel has arrived. You cannot change the delivery.</li>
      </ul>
      <form className="ps-panel" onSubmit={submit}>
        <h2>Contact us</h2>
        {reference ? <p className="ps-ok">Saved. Reference {reference}.</p> : null}
        {error ? <p className="ps-error">{error}</p> : null}
        <div className="ps-field">
          <label htmlFor="wd-help">Message</label>
          <textarea id="wd-help" value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
        <button className="ps-btn" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
