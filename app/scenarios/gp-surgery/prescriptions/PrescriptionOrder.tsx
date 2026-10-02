"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCircleCheck, faIdCard, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { GpCallout, GpSteps } from "../components/GpBlocks";
import { GP_BASE } from "../surgery-data";
import { sendPrescriptionOrder } from "../gp-api";
import { logOutPatient, usePatient } from "../gp-session";
import {
  EMPTY_PRESCRIPTION,
  ORDER_TYPES,
  PRACTICE_PHARMACY,
  formatOrderDate,
  lastRepeatOrder,
  orderedMedicineNames,
  prescriptionTasks,
  validateMedicines,
  type OrderType,
  type PastOrder,
  type Patient,
  type PrescriptionAnswers,
  type PrescriptionErrors,
} from "../prescription-order";
import PatientLogIn from "./PatientLogIn";

type Stage = "start" | "choose" | "check" | "done";
type FieldName = keyof PrescriptionErrors;

const FIELD_ORDER: FieldName[] = ["medicineIds", "medicineName", "reason"];

const fieldId = (name: FieldName) => `gp-rx-${name}`;

export default function PrescriptionOrder({ children }: { children?: ReactNode }) {
  const state = usePatient();
  const [stage, setStage] = useState<Stage>("start");
  const [justRegistered, setJustRegistered] = useState(false);
  const patient = state.status === "ready" ? state.patient : null;

  const logOut = () => {
    setStage("start");
    setJustRegistered(false);
    logOutPatient();
  };

  return (
    <>
      <div className="gp-wrap gp-content gp-consult">
        <div className="gp-consult__form">
          {state.status === "loading" ? <p className="gp-rx-loading">Loading…</p> : null}
          {state.status === "signed-out" ? <PatientLogIn onRegistered={() => setJustRegistered(true)} /> : null}
          {state.status === "not-found" ? (
            <section className="gp-rx-panel">
              <h2>We can&apos;t find your record</h2>
              <p>
                There is no patient called <strong>{state.username}</strong>. Records that are not used for 12 months are removed.
              </p>
              <button type="button" className="gp-btn gp-btn--primary" onClick={logOut}>
                Register again
              </button>
            </section>
          ) : null}
          {state.status === "error" ? (
            <section className="gp-rx-panel" role="alert">
              <h2>Something went wrong</h2>
              <p>We couldn&apos;t reach the surgery. Check you are connected to the internet, then try again.</p>
              <button type="button" className="gp-btn gp-btn--primary" onClick={state.retry}>
                Try again
              </button>
            </section>
          ) : null}
          {state.status === "ready" ? (
            <OrderFlow
              patient={state.patient}
              replacePatient={state.replace}
              stage={stage}
              setStage={setStage}
              justRegistered={justRegistered}
              onLogOut={logOut}
            />
          ) : null}
        </div>

        <PracticeCard patient={patient} done={stage === "done"} />
      </div>

      {stage === "start" ? children : null}
    </>
  );
}

type OrderFlowProps = {
  patient: Patient;
  replacePatient: (patient: Patient) => void;
  stage: Stage;
  setStage: (stage: Stage) => void;
  justRegistered: boolean;
  onLogOut: () => void;
};

function OrderFlow({ patient, replacePatient, stage, setStage, justRegistered, onLogOut }: OrderFlowProps) {
  const [orderType, setOrderType] = useState<OrderType>("repeat");
  const [answers, setAnswers] = useState<PrescriptionAnswers>(EMPTY_PRESCRIPTION);
  const [errors, setErrors] = useState<PrescriptionErrors>({});
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const hasNavigated = useRef(false);

  const isRepeat = orderType === "repeat";
  const errorList = FIELD_ORDER.filter((name) => errors[name]);
  const lastOrder = lastRepeatOrder(patient.orders);

  useEffect(() => {
    if (!hasNavigated.current) return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [stage]);

  const goTo = (next: Stage) => {
    hasNavigated.current = true;
    setErrors({});
    setSendError("");
    setStage(next);
  };

  const startOrder = (type: OrderType) => {
    setOrderType(type);
    setAnswers(EMPTY_PRESCRIPTION);
    goTo("choose");
  };

  const update = <K extends keyof PrescriptionAnswers>(name: K, value: PrescriptionAnswers[K]) => {
    setAnswers((current) => ({ ...current, [name]: value }));
    if (name !== "message" && errors[name as FieldName]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const toggleMedicine = (id: string, checked: boolean) => {
    const ids = checked ? [...answers.medicineIds, id] : answers.medicineIds.filter((item) => item !== id);
    update("medicineIds", ids);
  };

  const showErrors = (nextErrors: PrescriptionErrors) => {
    setErrors(nextErrors);
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage === "choose") {
      const nextErrors = validateMedicines(orderType, answers, patient.repeatMedicines);
      if (Object.keys(nextErrors).length > 0) {
        showErrors(nextErrors);
        return;
      }
      goTo("check");
      return;
    }

    if (sending) return;
    setSending(true);
    const result = await sendPrescriptionOrder(patient.username, { kind: orderType, ...answers });
    setSending(false);

    if (result.ok) {
      replacePatient(result.patient);
      setReference(result.reference);
      goTo("done");
    } else if (result.reason === "invalid") {
      setStage("choose");
      showErrors(result.errors);
    } else {
      setSendError("We couldn't send your order. Check you are connected to the internet, then try again.");
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    }
  };

  const errorFor = (name: FieldName) =>
    errors[name] ? (
      <p id={`${fieldId(name)}-error`} className="gp-field__error">
        <span className="gp-visually-hidden">Error: </span>
        {errors[name]}
      </p>
    ) : null;

  const describedBy = (name: FieldName) =>
    [`${fieldId(name)}-hint`, errors[name] ? `${fieldId(name)}-error` : null].filter(Boolean).join(" ");

  const medicineNames = orderedMedicineNames(orderType, answers, patient.repeatMedicines);

  if (stage === "start") {
    return (
      <>
        {justRegistered ? (
          <GpCallout>
            <strong>You are registered.</strong> Write down your username, <strong>{patient.username}</strong>, and your NHS number,{" "}
            <strong>{patient.nhsNumber}</strong>. You will need your username to log in next time.
          </GpCallout>
        ) : null}

        <section className="gp-rx-panel" aria-labelledby="gp-rx-details-heading">
          <div className="gp-rx-panel__top">
            <h2 id="gp-rx-details-heading">Your details</h2>
            <button type="button" className="gp-link-button" onClick={onLogOut}>
              Log out
            </button>
          </div>
          <dl className="gp-rx-details">
            <div>
              <dt>Name</dt>
              <dd>{patient.fullName}</dd>
            </div>
            <div>
              <dt>NHS number</dt>
              <dd>{patient.nhsNumber}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{`${patient.addressLine1}\n${patient.townOrCity}\n${patient.postcode}`}</dd>
            </div>
            <div>
              <dt>Your pharmacy</dt>
              <dd>{PRACTICE_PHARMACY.name}</dd>
            </div>
          </dl>
        </section>

        {lastOrder ? (
          <section className="gp-rx-panel" aria-labelledby="gp-rx-last-heading">
            <h2 id="gp-rx-last-heading">Your last prescription</h2>
            <p>
              Ordered on <strong>{formatOrderDate(lastOrder.placedAt)}</strong>. {lastOrder.status}.
            </p>
            <ul className="gp-rx-medicines">
              {lastOrder.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="gp-rx-heading">
          <h2 id="gp-rx-heading" className="gp-consult__title" ref={headingRef} tabIndex={-1}>
            What would you like to order?
          </h2>
          <div className="gp-order-choices">
            {ORDER_TYPES.map((type) => (
              <button key={type.id} type="button" className="gp-order-choice" onClick={() => startOrder(type.id)}>
                <span className="gp-order-choice__text">
                  <strong>{type.label}</strong>
                  <span>{type.hint}</span>
                </span>
                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="gp-order-choice__arrow" />
              </button>
            ))}
          </div>
        </section>

        <OrderHistory orders={patient.orders} />
      </>
    );
  }

  if (stage === "done") {
    return (
      <section aria-labelledby="gp-rx-heading">
        <div className="gp-confirmation">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="gp-confirmation__icon" />
          <h2 id="gp-rx-heading" ref={headingRef} tabIndex={-1}>
            Order sent
          </h2>
          <p className="gp-confirmation__reference">
            Your reference number is
            <strong>{reference}</strong>
          </p>
        </div>

        <GpSteps
          steps={
            isRepeat && !answers.message.trim()
              ? [
                  { title: `We send your order to ${PRACTICE_PHARMACY.name}` },
                  { title: "Collect your medicine", text: "It will be ready in 3 working days." },
                ]
              : [
                  {
                    title: isRepeat ? "A doctor reads your message and checks your order" : "A doctor checks your request",
                    text: "Within 2 working days.",
                  },
                  { title: `If the doctor agrees, we send it to ${PRACTICE_PHARMACY.name}` },
                  { title: "We text you when it is ready to collect" },
                ]
          }
        />
        <p>Your order has been saved in your prescription history.</p>

        <div className="gp-form-actions">
          <button type="button" className="gp-btn gp-btn--primary" onClick={() => goTo("start")}>
            See my prescriptions
          </button>
          <Link href={`${GP_BASE}/`} className="gp-btn gp-btn--secondary">
            Go to the home page
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="gp-rx-heading">
      <p className="gp-consult__progress">
        {isRepeat ? "Repeat prescription" : "Prescription"}: step {stage === "choose" ? 1 : 2} of 2
      </p>
      <h2 id="gp-rx-heading" className="gp-consult__title" ref={headingRef} tabIndex={-1}>
        {stage === "check" ? "Check and send" : isRepeat ? "Which medicines do you need?" : "What medicine do you need?"}
      </h2>

      {sendError ? (
        <div className="gp-error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
          <h3>Your order was not sent</h3>
          <p>{sendError}</p>
        </div>
      ) : errorList.length > 0 ? (
        <div className="gp-error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
          <h3>There is a problem</h3>
          <ul>
            {errorList.map((name) => (
              <li key={name}>
                <a href={`#${fieldId(name)}`}>{errors[name]}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {stage === "choose" && isRepeat ? (
        <div className={`gp-field ${errors.medicineIds ? "has-error" : ""}`}>
          <fieldset className="gp-fieldset" aria-describedby={describedBy("medicineIds")}>
            <legend className="gp-visually-hidden">Your repeat medicines</legend>
            <p id={`${fieldId("medicineIds")}-hint`} className="gp-field__hint">
              These are the medicines on your repeat list. Tick each one you need.
            </p>
            {errorFor("medicineIds")}
            <div className="gp-radios">
              {patient.repeatMedicines.map((medicine, index) => {
                const id = index === 0 ? fieldId("medicineIds") : `${fieldId("medicineIds")}-${index}`;
                return (
                  <div key={medicine.id} className="gp-checkbox gp-checkbox--boxed">
                    <input
                      id={id}
                      type="checkbox"
                      checked={answers.medicineIds.includes(medicine.id)}
                      onChange={(event) => toggleMedicine(medicine.id, event.target.checked)}
                      aria-describedby={`${id}-hint`}
                    />
                    <label htmlFor={id}>
                      <strong>{medicine.name}</strong>
                      <span id={`${id}-hint`} className="gp-radio__hint">
                        {medicine.instructions}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>
      ) : null}

      {stage === "choose" && isRepeat ? (
        <div className="gp-field">
          <label htmlFor="gp-rx-message" className="gp-label">
            Message for the surgery <span className="gp-optional">(optional)</span>
          </label>
          <p id="gp-rx-message-hint" className="gp-field__hint">
            For example: I am on holiday next month. Can I have next month&apos;s medicine too?
          </p>
          <textarea
            id="gp-rx-message"
            rows={3}
            className="gp-input gp-textarea gp-textarea--short"
            value={answers.message}
            maxLength={300}
            onChange={(event) => update("message", event.target.value)}
            aria-describedby="gp-rx-message-hint"
          />
        </div>
      ) : null}

      {stage === "choose" && !isRepeat ? (
        <>
          <div className={`gp-field ${errors.medicineName ? "has-error" : ""}`}>
            <label htmlFor={fieldId("medicineName")} className="gp-label">
              Name of the medicine
            </label>
            <p id={`${fieldId("medicineName")}-hint`} className="gp-field__hint">
              For example: paracetamol tablets
            </p>
            {errorFor("medicineName")}
            <input
              id={fieldId("medicineName")}
              type="text"
              className="gp-input gp-input--medium"
              value={answers.medicineName}
              maxLength={60}
              onChange={(event) => update("medicineName", event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={errors.medicineName ? true : undefined}
              aria-describedby={describedBy("medicineName")}
            />
          </div>
          <div className={`gp-field ${errors.reason ? "has-error" : ""}`}>
            <label htmlFor={fieldId("reason")} className="gp-label">
              Why do you need it?
            </label>
            <p id={`${fieldId("reason")}-hint`} className="gp-field__hint">
              For example: the doctor said I could have it.
            </p>
            {errorFor("reason")}
            <textarea
              id={fieldId("reason")}
              rows={3}
              className="gp-input gp-textarea gp-textarea--short"
              value={answers.reason}
              maxLength={300}
              onChange={(event) => update("reason", event.target.value)}
              aria-invalid={errors.reason ? true : undefined}
              aria-describedby={describedBy("reason")}
            />
          </div>
        </>
      ) : null}

      {stage === "check" ? (
        <dl className="gp-summary">
          <div className="gp-summary__row">
            <dt>{medicineNames.length === 1 ? "Medicine" : "Medicines"}</dt>
            <dd>{medicineNames.join("\n")}</dd>
            <dd className="gp-summary__action">
              <button type="button" className="gp-link-button" onClick={() => goTo("choose")}>
                Change<span className="gp-visually-hidden"> medicine</span>
              </button>
            </dd>
          </div>
          {!isRepeat ? (
            <div className="gp-summary__row">
              <dt>Why you need it</dt>
              <dd>{answers.reason.trim()}</dd>
              <dd className="gp-summary__action" />
            </div>
          ) : null}
          {isRepeat ? (
            <div className="gp-summary__row">
              <dt>Your message</dt>
              <dd>{answers.message.trim() || "No message"}</dd>
              <dd className="gp-summary__action">
                <button type="button" className="gp-link-button" onClick={() => goTo("choose")}>
                  Change<span className="gp-visually-hidden"> message</span>
                </button>
              </dd>
            </div>
          ) : null}
          <div className="gp-summary__row">
            <dt>For</dt>
            <dd>{`${patient.fullName}\nNHS number ${patient.nhsNumber}`}</dd>
            <dd className="gp-summary__action" />
          </div>
          <div className="gp-summary__row">
            <dt>Collect from</dt>
            <dd>{`${PRACTICE_PHARMACY.name}\n${PRACTICE_PHARMACY.address}`}</dd>
            <dd className="gp-summary__action" />
          </div>
        </dl>
      ) : null}

      <div className="gp-form-actions">
        <button type="submit" className="gp-btn gp-btn--primary" disabled={sending}>
          {stage === "check" ? (sending ? "Sending…" : "Send order") : "Continue"}
        </button>
        <button type="button" className="gp-link-button" onClick={() => goTo(stage === "check" ? "choose" : "start")}>
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back
        </button>
      </div>
    </form>
  );
}

function OrderHistory({ orders }: { orders: PastOrder[] }) {
  return (
    <section className="gp-rx-history" aria-labelledby="gp-rx-history-heading">
      <h2 id="gp-rx-history-heading">Your prescription history</h2>
      <ol className="gp-rx-history__list">
        {orders.map((order) => (
          <li key={order.id} className="gp-rx-history__item">
            <p className="gp-rx-history__date">
              <strong>{formatOrderDate(order.placedAt)}</strong>
              <span>{order.reference}</span>
            </p>
            <p className="gp-rx-history__kind">{order.kind === "repeat" ? "Repeat prescription" : "Prescription"}</p>
            <ul className="gp-rx-medicines">
              {order.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {order.reason ? <p className="gp-rx-history__note">Why you need it: {order.reason}</p> : null}
            {order.message ? <p className="gp-rx-history__note">Your message: {order.message}</p> : null}
            <p className="gp-rx-history__status">{order.status}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PracticeCard({ patient, done }: { patient: Patient | null; done: boolean }) {
  const tasks = patient ? prescriptionTasks(patient) : [];
  const [taskId, setTaskId] = useState("");
  const task = tasks.find((item) => item.id === taskId) ?? tasks[0];

  return (
    <aside className="gp-practice-card" aria-labelledby="gp-rx-practice-card-heading">
      <h2 id="gp-rx-practice-card-heading">
        <FontAwesomeIcon icon={faIdCard} aria-hidden="true" /> Your practice card
      </h2>
      <p className="gp-practice-card__note">
        <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Use these pretend details. Never type your real medical
        or personal information.
      </p>

      {patient && task ? (
        <>
          <label htmlFor="gp-rx-practice-situation" className="gp-practice-card__label">
            Practice situation
          </label>
          <select id="gp-rx-practice-situation" className="gp-input" value={task.id} onChange={(event) => setTaskId(event.target.value)}>
            {tasks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <p className="gp-practice-card__situation">{task.situation}</p>

          <h3>You are</h3>
          <dl className="gp-practice-card__details">
            <div>
              <dt>Name</dt>
              <dd>{patient.fullName}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{patient.username}</dd>
            </div>
            <div>
              <dt>NHS number</dt>
              <dd>{patient.nhsNumber}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="gp-practice-card__situation">
          Register with a username, like JohnSmith. The surgery gives you a pretend patient record with your own repeat medicines.
          Next time, log in with the same username to see your prescriptions again.
        </p>
      )}

      {done ? <p className="gp-practice-card__done">Nothing was really sent. Choose another situation and try again.</p> : null}
    </aside>
  );
}
