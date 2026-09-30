"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faIdCard, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import UrgentHelp from "../components/UrgentHelp";
import { GpDoDont, GpSteps } from "../components/GpBlocks";
import { GP_BASE } from "../surgery-data";
import {
  CONTACT_METHODS,
  DURATIONS,
  EMPTY_ANSWERS,
  HELP_OPTIONS,
  PRACTICE_PATIENT,
  PRACTICE_SITUATIONS,
  REASONS,
  STEPS,
  isMedicalReason,
  makeReference,
  validateStep,
  type ConsultationAnswers,
  type ConsultationErrors,
  type ConsultationStep,
} from "../consultation";

type Stage = "start" | ConsultationStep | "done";
type FieldName = keyof ConsultationErrors;

const FIELD_ORDER: FieldName[] = [
  "forWhom",
  "reason",
  "description",
  "duration",
  "isNew",
  "change",
  "helpWanted",
  "firstName",
  "lastName",
  "dob",
  "phone",
  "email",
  "contactMethod",
  "confirmedNotUrgent",
];

const fieldId = (name: FieldName) => (name === "dob" ? "gp-dobDay" : `gp-${name}`);

const IS_NEW_OPTIONS = [
  { value: "yes", label: "Yes, this is a new problem" },
  { value: "no", label: "No, I have had this problem before" },
];

const CHANGE_OPTIONS = [
  { value: "worse", label: "Getting worse" },
  { value: "same", label: "Staying the same" },
  { value: "better", label: "Getting better" },
];

const FOR_WHOM_OPTIONS = [
  { value: "me", label: "Myself" },
  { value: "someone-else", label: "Someone I care for, such as my child" },
];

function optionLabel(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function ConsultationForm() {
  const [stage, setStage] = useState<Stage>("start");
  const [answers, setAnswers] = useState<ConsultationAnswers>(EMPTY_ANSWERS);
  const [errors, setErrors] = useState<ConsultationErrors>({});
  const [returnToCheck, setReturnToCheck] = useState(false);
  const [reference, setReference] = useState("");
  const [situationId, setSituationId] = useState(PRACTICE_SITUATIONS[0].id);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const hasNavigated = useRef(false);

  const situation = PRACTICE_SITUATIONS.find((item) => item.id === situationId) ?? PRACTICE_SITUATIONS[0];
  const stepIndex = STEPS.findIndex((step) => step.id === stage);
  const medical = isMedicalReason(answers.reason);
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

  const update = <K extends keyof ConsultationAnswers>(name: K, value: ConsultationAnswers[K]) => {
    setAnswers((current) => ({ ...current, [name]: value }));
    const errorKey: FieldName = name === "dobDay" || name === "dobMonth" || name === "dobYear" ? "dob" : name;
    if (errors[errorKey]) setErrors((current) => ({ ...current, [errorKey]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage === "start" || stage === "done") return;

    const nextErrors = validateStep(stage, answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    if (stage === "check") {
      setReference(makeReference());
      goTo("done");
      return;
    }

    if (returnToCheck) {
      goTo("check");
      return;
    }
    goTo(STEPS[stepIndex + 1].id);
  };

  const goBack = () => {
    if (returnToCheck) {
      goTo("check");
      return;
    }
    goTo(stepIndex <= 0 ? "start" : STEPS[stepIndex - 1].id);
  };

  const changeAnswer = (step: ConsultationStep) => {
    setReturnToCheck(true);
    goTo(step);
  };

  const startAgain = () => {
    setAnswers(EMPTY_ANSWERS);
    setReturnToCheck(false);
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

  const describedBy = (name: FieldName, hint?: boolean) =>
    [hint ? `${fieldId(name)}-hint` : null, errors[name] ? `${fieldId(name)}-error` : null].filter(Boolean).join(" ") || undefined;

  const renderRadios = (
    name: "forWhom" | "reason" | "isNew" | "change" | "helpWanted" | "contactMethod",
    legend: string,
    options: { value: string; label: string; hint?: string }[],
    hint?: string,
  ) => (
    <div className={`gp-field ${errors[name] ? "has-error" : ""}`}>
      <fieldset className="gp-fieldset" aria-describedby={describedBy(name, Boolean(hint))}>
        <legend>{legend}</legend>
        {hint ? (
          <p id={`${fieldId(name)}-hint`} className="gp-field__hint">
            {hint}
          </p>
        ) : null}
        {errorFor(name)}
        <div className="gp-radios">
          {options.map((option, index) => {
            const id = index === 0 ? fieldId(name) : `${fieldId(name)}-${index}`;
            return (
              <div key={option.value} className="gp-radio">
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={answers[name] === option.value}
                  onChange={() => update(name, option.value as ConsultationAnswers[typeof name])}
                  aria-describedby={option.hint ? `${id}-hint` : undefined}
                />
                <label htmlFor={id}>
                  {option.label}
                  {option.hint ? (
                    <span id={`${id}-hint`} className="gp-radio__hint">
                      {option.hint}
                    </span>
                  ) : null}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );

  const renderInput = (
    name: "firstName" | "lastName" | "phone" | "email",
    label: string,
    options: { hint?: string; type?: string; optional?: boolean; width?: "short" | "medium" } = {},
  ) => (
    <div className={`gp-field ${errors[name] ? "has-error" : ""}`}>
      <label htmlFor={fieldId(name)} className="gp-label">
        {label}
        {options.optional ? <span className="gp-optional"> (optional)</span> : null}
      </label>
      {options.hint ? (
        <p id={`${fieldId(name)}-hint`} className="gp-field__hint">
          {options.hint}
        </p>
      ) : null}
      {errorFor(name)}
      <input
        id={fieldId(name)}
        name={name}
        type={options.type ?? "text"}
        className={`gp-input ${options.width ? `gp-input--${options.width}` : ""}`}
        value={answers[name]}
        onChange={(event) => update(name, event.target.value)}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name, Boolean(options.hint))}
      />
    </div>
  );

  const renderTextarea = (name: "description" | "extra", label: string, hint: string, optional = false) => (
    <div className={`gp-field ${errors[name] ? "has-error" : ""}`}>
      <label htmlFor={fieldId(name)} className="gp-label">
        {label}
        {optional ? <span className="gp-optional"> (optional)</span> : null}
      </label>
      <p id={`${fieldId(name)}-hint`} className="gp-field__hint">
        {hint}
      </p>
      {errorFor(name)}
      <textarea
        id={fieldId(name)}
        name={name}
        rows={5}
        className="gp-input gp-textarea"
        value={answers[name]}
        onChange={(event) => update(name, event.target.value)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name, true)}
      />
    </div>
  );

  const summaryRows: { label: string; value: ReactNode; step: ConsultationStep }[] = [
    { label: "Who is this for", value: optionLabel(FOR_WHOM_OPTIONS, answers.forWhom), step: "reason" },
    { label: "What you need help with", value: REASONS.find((reason) => reason.id === answers.reason)?.label, step: "reason" },
    { label: medical ? "Your problem" : "Your request", value: answers.description, step: "problem" },
    ...(medical
      ? [
          { label: "How long", value: answers.duration, step: "problem" as const },
          { label: "New problem", value: optionLabel(IS_NEW_OPTIONS, answers.isNew), step: "problem" as const },
          { label: "Better or worse", value: optionLabel(CHANGE_OPTIONS, answers.change), step: "problem" as const },
        ]
      : []),
    { label: "What you would like", value: answers.helpWanted, step: "problem" },
    { label: "Anything else", value: answers.extra.trim() || "None", step: "problem" },
    { label: "Name", value: `${answers.firstName.trim()} ${answers.lastName.trim()}`, step: "details" },
    { label: "Date of birth", value: `${answers.dobDay}/${answers.dobMonth}/${answers.dobYear}`, step: "details" },
    { label: "Phone", value: answers.phone, step: "details" },
    { label: "Email", value: answers.email.trim() || "Not given", step: "details" },
    {
      label: "Contact me by",
      value: CONTACT_METHODS.find((method) => method.id === answers.contactMethod)?.label,
      step: "details",
    },
  ];

  const contactMethodLabel = CONTACT_METHODS.find((method) => method.id === answers.contactMethod)?.label.toLowerCase();

  return (
    <div className="gp-wrap gp-content gp-consult">
      <div className="gp-consult__form">
        {stage === "start" ? (
          <section aria-labelledby="gp-consult-heading">
            <h2 id="gp-consult-heading" className="gp-consult__title" ref={headingRef} tabIndex={-1}>
              Before you start
            </h2>
            <GpDoDont
              yesTitle="Use this form for"
              yes={["A health problem", "A question about your medicine", "A fit note, letter or test results"]}
              noTitle="Do not use this form for"
              no={[
                <>
                  Ordering medicine. See <Link href={`${GP_BASE}/prescriptions/`}>prescriptions</Link>.
                </>,
                <>
                  Changing an appointment. See <Link href={`${GP_BASE}/appointments/#change-or-cancel`}>appointments</Link>.
                </>,
                "Anything urgent",
              ]}
            />
            <UrgentHelp compact />
            <p className="gp-consult__timing">
              It takes about <strong>5 minutes</strong>. We read forms Monday to Friday, 8:00am to 6:00pm.
            </p>
            <button type="button" className="gp-btn gp-btn--primary gp-btn--start" onClick={() => goTo("reason")}>
              Start now
            </button>
          </section>
        ) : null}

        {stage !== "start" && stage !== "done" ? (
          <form onSubmit={handleSubmit} noValidate aria-labelledby="gp-consult-heading">
            <p className="gp-consult__progress">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
            <h2 id="gp-consult-heading" className="gp-consult__title" ref={headingRef} tabIndex={-1}>
              {STEPS[stepIndex].title}
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

            {stage === "reason" ? (
              <>
                {renderRadios("forWhom", "Who is this request for?", FOR_WHOM_OPTIONS)}
                {renderRadios(
                  "reason",
                  "What do you need help with?",
                  REASONS.map((reason) => ({ value: reason.id, label: reason.label, hint: reason.hint })),
                )}
              </>
            ) : null}

            {stage === "problem" ? (
              <>
                {medical
                  ? renderTextarea(
                      "description",
                      "What is the problem?",
                      "What is wrong? How does it affect you?",
                    )
                  : renderTextarea("description", "What do you need?", "For example: a fit note for work.")}

                {medical ? (
                  <>
                    <div className={`gp-field ${errors.duration ? "has-error" : ""}`}>
                      <label htmlFor={fieldId("duration")} className="gp-label">
                        How long have you had this problem?
                      </label>
                      {errorFor("duration")}
                      <select
                        id={fieldId("duration")}
                        className="gp-input gp-input--medium"
                        value={answers.duration}
                        onChange={(event) => update("duration", event.target.value)}
                        aria-invalid={errors.duration ? true : undefined}
                        aria-describedby={describedBy("duration")}
                      >
                        <option value="">Please select</option>
                        {DURATIONS.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration}
                          </option>
                        ))}
                      </select>
                    </div>
                    {renderRadios("isNew", "Is this a new problem?", IS_NEW_OPTIONS)}
                    {renderRadios("change", "Is it getting better, worse or staying the same?", CHANGE_OPTIONS)}
                  </>
                ) : null}

                {renderRadios(
                  "helpWanted",
                  "What would you like us to help you with?",
                  HELP_OPTIONS.map((option) => ({ value: option, label: option })),
                  "The surgery will decide the best way to help.",
                )}

                {renderTextarea(
                  "extra",
                  "Is there anything else you think we should know?",
                  "For example: times when you cannot answer the phone.",
                  true,
                )}
              </>
            ) : null}

            {stage === "details" ? (
              <>
                <p className="gp-consult__intro">
                  {answers.forWhom === "someone-else"
                    ? "Enter the details of the person this request is about."
                    : "We need these details to find your medical record."}
                </p>
                {renderInput("firstName", "First name", { width: "medium" })}
                {renderInput("lastName", "Last name", { width: "medium" })}

                <div className={`gp-field ${errors.dob ? "has-error" : ""}`}>
                  <fieldset className="gp-fieldset" aria-describedby={describedBy("dob", true)}>
                    <legend>Date of birth</legend>
                    <p id={`${fieldId("dob")}-hint`} className="gp-field__hint">
                      For example, 14 3 1985
                    </p>
                    {errorFor("dob")}
                    <div className="gp-date">
                      {(
                        [
                          ["dobDay", "Day", 2],
                          ["dobMonth", "Month", 2],
                          ["dobYear", "Year", 4],
                        ] as const
                      ).map(([name, label, maxLength]) => (
                        <div key={name} className="gp-date__part">
                          <label htmlFor={`gp-${name}`}>{label}</label>
                          <input
                            id={`gp-${name}`}
                            className={`gp-input gp-input--${maxLength === 4 ? "year" : "day"}`}
                            inputMode="numeric"
                            maxLength={maxLength}
                            value={answers[name]}
                            onChange={(event) => update(name, event.target.value)}
                            autoComplete="off"
                            aria-invalid={errors.dob ? true : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {renderInput("phone", "Phone number", { type: "tel", hint: "We may call or text you on this number.", width: "medium" })}
                {renderInput("email", "Email address", { type: "email", optional: true })}
                {renderRadios(
                  "contactMethod",
                  "How would you like us to contact you?",
                  CONTACT_METHODS.map((method) => ({ value: method.id, label: method.label })),
                )}
              </>
            ) : null}

            {stage === "check" ? (
              <>
                <dl className="gp-summary">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="gp-summary__row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                      <dd className="gp-summary__action">
                        <button type="button" className="gp-link-button" onClick={() => changeAnswer(row.step)}>
                          Change<span className="gp-visually-hidden"> {row.label.toLowerCase()}</span>
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className={`gp-field ${errors.confirmedNotUrgent ? "has-error" : ""}`}>
                  {errorFor("confirmedNotUrgent")}
                  <div className="gp-checkbox">
                    <input
                      id={fieldId("confirmedNotUrgent")}
                      type="checkbox"
                      checked={answers.confirmedNotUrgent}
                      onChange={(event) => update("confirmedNotUrgent", event.target.checked)}
                      aria-describedby={describedBy("confirmedNotUrgent")}
                    />
                    <label htmlFor={fieldId("confirmedNotUrgent")}>
                      I confirm this request is not an emergency. I understand I should call 999 in an emergency, or 111 if I
                      need urgent help.
                    </label>
                  </div>
                </div>
              </>
            ) : null}

            <div className="gp-form-actions">
              <button type="submit" className="gp-btn gp-btn--primary">
                {stage === "check" ? "Send request" : returnToCheck ? "Save and go back to check your answers" : "Continue"}
              </button>
              <button type="button" className="gp-link-button" onClick={goBack}>
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back
              </button>
            </div>
          </form>
        ) : null}

        {stage === "done" ? (
          <section aria-labelledby="gp-consult-heading">
            <div className="gp-confirmation">
              <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" className="gp-confirmation__icon" />
              <h2 id="gp-consult-heading" ref={headingRef} tabIndex={-1}>
                Request submitted
              </h2>
              <p className="gp-confirmation__reference">
                Your reference number is
                <strong>{reference}</strong>
              </p>
            </div>

            <div className="gp-prose">
              <p>
                Thank you. Your request has been submitted. A member of the practice team will review your request and contact you
                if necessary.
              </p>
            </div>
            <GpSteps
              steps={[
                { title: "We read your request", text: "By the end of the next working day." },
                { title: `We contact you by ${contactMethodLabel ?? "phone"}`, text: "If we need to." },
              ]}
            />
            <div className="gp-prose">
              <p>
                Feeling worse? Call <strong>111</strong>. Emergency? Call <strong>999</strong>.
              </p>
            </div>

            <div className="gp-form-actions">
              <Link href={`${GP_BASE}/`} className="gp-btn gp-btn--primary">
                Go to the home page
              </Link>
              <button type="button" className="gp-btn gp-btn--secondary" onClick={startAgain}>
                Send another request
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <aside className="gp-practice-card" aria-labelledby="gp-practice-card-heading">
        <h2 id="gp-practice-card-heading">
          <FontAwesomeIcon icon={faIdCard} aria-hidden="true" /> Your practice card
        </h2>
        <p className="gp-practice-card__note">
          <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Use these pretend details. Never type your real
          medical or personal information.
        </p>

        <label htmlFor="gp-practice-situation" className="gp-practice-card__label">
          Practice situation
        </label>
        <select
          id="gp-practice-situation"
          className="gp-input"
          value={situationId}
          onChange={(event) => setSituationId(event.target.value)}
        >
          {PRACTICE_SITUATIONS.map((item) => (
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
            <dt>Date of birth</dt>
            <dd>{PRACTICE_PATIENT.dateOfBirth}</dd>
          </div>
          <div>
            <dt>Mobile</dt>
            <dd>{PRACTICE_PATIENT.phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{PRACTICE_PATIENT.email}</dd>
          </div>
        </dl>

        {stage === "done" ? (
          <p className="gp-practice-card__done">Nothing was really sent. Choose another situation and try again.</p>
        ) : null}
      </aside>
    </div>
  );
}
