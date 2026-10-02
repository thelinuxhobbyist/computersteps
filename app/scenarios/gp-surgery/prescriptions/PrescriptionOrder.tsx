"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCircleCheck, faIdCard, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { GpSteps } from "../components/GpBlocks";
import { PRACTICE_PATIENT } from "../consultation";
import { GP_BASE } from "../surgery-data";
import {
  EMPTY_PRESCRIPTION,
  ORDER_TYPES,
  PRACTICE_PHARMACY,
  PRESCRIPTION_SITUATIONS,
  REPEAT_MEDICINES,
  makePrescriptionReference,
  orderedMedicineNames,
  validateMedicines,
  type OrderType,
  type PrescriptionAnswers,
  type PrescriptionErrors,
} from "../prescription-order";

type Stage = "start" | "choose" | "check" | "done";
type FieldName = keyof PrescriptionErrors;

const FIELD_ORDER: FieldName[] = ["medicineIds", "medicineName", "reason"];

const fieldId = (name: FieldName) => `gp-rx-${name}`;

export default function PrescriptionOrder({ children }: { children?: ReactNode }) {
  const [stage, setStage] = useState<Stage>("start");
  const [orderType, setOrderType] = useState<OrderType>("repeat");
  const [answers, setAnswers] = useState<PrescriptionAnswers>(EMPTY_PRESCRIPTION);
  const [errors, setErrors] = useState<PrescriptionErrors>({});
  const [reference, setReference] = useState("");
  const [situationId, setSituationId] = useState(PRESCRIPTION_SITUATIONS[0].id);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const hasNavigated = useRef(false);

  const situation = PRESCRIPTION_SITUATIONS.find((item) => item.id === situationId) ?? PRESCRIPTION_SITUATIONS[0];
  const isRepeat = orderType === "repeat";
  const errorList = FIELD_ORDER.filter((name) => errors[name]);

  useEffect(() => {
    if (!hasNavigated.current) return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [stage]);

  const goTo = (next: Stage) => {
    hasNavigated.current = true;
    setErrors({});
    setStage(next);
  };

  const startOrder = (type: OrderType) => {
    setOrderType(type);
    setAnswers(EMPTY_PRESCRIPTION);
    goTo("choose");
  };

  const update = <K extends keyof PrescriptionAnswers>(name: K, value: PrescriptionAnswers[K]) => {
    setAnswers((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const toggleMedicine = (id: string, checked: boolean) => {
    const ids = checked ? [...answers.medicineIds, id] : answers.medicineIds.filter((item) => item !== id);
    update("medicineIds", ids);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage === "check") {
      setReference(makePrescriptionReference());
      goTo("done");
      return;
    }

    const nextErrors = validateMedicines(orderType, answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    goTo("check");
  };

  const startAgain = () => {
    setAnswers(EMPTY_PRESCRIPTION);
    setReference("");
    goTo("start");
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

  const medicineNames = orderedMedicineNames(orderType, answers);

  return (
    <>
      <div className="gp-wrap gp-content gp-consult">
        <div className="gp-consult__form">
          {stage === "start" ? (
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
          ) : null}

          {stage === "choose" || stage === "check" ? (
            <form onSubmit={handleSubmit} noValidate aria-labelledby="gp-rx-heading">
              <p className="gp-consult__progress">
                {isRepeat ? "Repeat prescription" : "Prescription"}: step {stage === "choose" ? 1 : 2} of 2
              </p>
              <h2 id="gp-rx-heading" className="gp-consult__title" ref={headingRef} tabIndex={-1}>
                {stage === "check" ? "Check and send" : isRepeat ? "Which medicines do you need?" : "What medicine do you need?"}
              </h2>

              {errorList.length > 0 ? (
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
                      Tick each medicine you need.
                    </p>
                    {errorFor("medicineIds")}
                    <div className="gp-radios">
                      {REPEAT_MEDICINES.map((medicine, index) => {
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
                  <div className="gp-summary__row">
                    <dt>For</dt>
                    <dd>
                      {PRACTICE_PATIENT.firstName} {PRACTICE_PATIENT.lastName}
                    </dd>
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
                <button type="submit" className="gp-btn gp-btn--primary">
                  {stage === "check" ? "Send order" : "Continue"}
                </button>
                <button type="button" className="gp-link-button" onClick={() => goTo(stage === "check" ? "choose" : "start")}>
                  <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back
                </button>
              </div>
            </form>
          ) : null}

          {stage === "done" ? (
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
                  isRepeat
                    ? [
                        { title: `We send your order to ${PRACTICE_PHARMACY.name}` },
                        { title: "Collect your medicine", text: "It will be ready in 3 working days." },
                      ]
                    : [
                        { title: "A doctor checks your request", text: "Within 2 working days." },
                        { title: `If the doctor agrees, we send it to ${PRACTICE_PHARMACY.name}` },
                        { title: "We text you when it is ready to collect" },
                      ]
                }
              />

              <div className="gp-form-actions">
                <button type="button" className="gp-btn gp-btn--primary" onClick={startAgain}>
                  Order something else
                </button>
                <Link href={`${GP_BASE}/`} className="gp-btn gp-btn--secondary">
                  Go to the home page
                </Link>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="gp-practice-card" aria-labelledby="gp-rx-practice-card-heading">
          <h2 id="gp-rx-practice-card-heading">
            <FontAwesomeIcon icon={faIdCard} aria-hidden="true" /> Your practice card
          </h2>
          <p className="gp-practice-card__note">
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Use these pretend details. Never type your real
            medical or personal information.
          </p>

          <label htmlFor="gp-rx-practice-situation" className="gp-practice-card__label">
            Practice situation
          </label>
          <select
            id="gp-rx-practice-situation"
            className="gp-input"
            value={situationId}
            onChange={(event) => setSituationId(event.target.value)}
          >
            {PRESCRIPTION_SITUATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <p className="gp-practice-card__situation">{situation.situation}</p>

          <h3>You are</h3>
          <dl className="gp-practice-card__details">
            <div>
              <dt>Name</dt>
              <dd>
                {PRACTICE_PATIENT.firstName} {PRACTICE_PATIENT.lastName}
              </dd>
            </div>
            <div>
              <dt>Your pharmacy</dt>
              <dd>{PRACTICE_PHARMACY.name}</dd>
            </div>
          </dl>

          {stage === "done" ? (
            <p className="gp-practice-card__done">Nothing was really sent. Choose another situation and try again.</p>
          ) : null}
        </aside>
      </div>

      {stage === "start" ? children : null}
    </>
  );
}
