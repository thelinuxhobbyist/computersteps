"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLock, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import SiteHeader from "../components/SiteHeader";
import ShopBar from "../components/shop/ShopBar";
import OrderSummary from "../components/shop/OrderSummary";
import PracticeBankCard from "../components/shop/PracticeBankCard";
import { clearBasket, savePracticeOrder, useBasket, useHasMounted } from "../shop/basket-store";
import {
  validateCardDetails,
  validateDeliveryDetails,
  type CardDetails,
  type DeliveryDetails,
  type FieldErrors,
} from "../shop/shop-data";

type FormValues = DeliveryDetails & CardDetails;
type FieldName = keyof FormValues;

const EMPTY_FORM: FormValues = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  townOrCity: "",
  postcode: "",
  nameOnCard: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

const FIELD_ORDER: FieldName[] = [
  "fullName",
  "addressLine1",
  "addressLine2",
  "townOrCity",
  "postcode",
  "nameOnCard",
  "cardNumber",
  "expiry",
  "cvv",
];

type FieldConfig = {
  label: string;
  hint?: string;
  optional?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric";
  narrow?: boolean;
};

const FIELDS: Record<FieldName, FieldConfig> = {
  fullName: { label: "Full Name" },
  addressLine1: { label: "Address Line 1", hint: "House number and street" },
  addressLine2: { label: "Address Line 2", optional: true },
  townOrCity: { label: "Town / City" },
  postcode: { label: "Postcode", placeholder: "For example: AB1 2CD", maxLength: 10, narrow: true },
  nameOnCard: { label: "Name on Card", hint: "Type it as it is shown on the card" },
  cardNumber: {
    label: "16-Digit Card Number",
    hint: "The long number on the front of the card. Spaces are fine.",
    placeholder: "0000 0000 0000 0000",
    maxLength: 23,
    inputMode: "numeric",
  },
  expiry: { label: "Expiry Date (MM/YY)", placeholder: "MM/YY", maxLength: 7, inputMode: "numeric", narrow: true },
  cvv: {
    label: "Security Code (CVV)",
    hint: "3 numbers",
    placeholder: "123",
    maxLength: 3,
    inputMode: "numeric",
    narrow: true,
  },
};

function makeOrderNumber() {
  return `PS-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function CheckoutForm() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const { lines, totals, itemCount } = useBasket();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<FormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const update = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors<FormValues> = { ...validateDeliveryDetails(values), ...validateCardDetails(values) };
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    savePracticeOrder({
      orderNumber: makeOrderNumber(),
      placedAt: new Date().toISOString(),
      lines,
      delivery: {
        fullName: values.fullName.trim(),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2.trim(),
        townOrCity: values.townOrCity.trim(),
        postcode: values.postcode.trim().toUpperCase(),
      },
    });
    clearBasket();
    router.push("/checkout/success/");
  };

  const renderField = (name: FieldName) => {
    const field = FIELDS[name];
    const inputId = `checkout-${name}`;
    const hintId = field.hint ? `${inputId}-hint` : undefined;
    const errorId = errors[name] ? `${inputId}-error` : undefined;

    return (
      <div className={`checkout-field ${field.narrow ? "checkout-field--narrow" : ""} ${errors[name] ? "has-error" : ""}`}>
        <label htmlFor={inputId}>
          {field.label}
          {field.optional ? <span className="checkout-field__optional"> (optional)</span> : null}
        </label>
        {field.hint ? (
          <p id={hintId} className="checkout-field__hint">
            {field.hint}
          </p>
        ) : null}
        {errors[name] ? (
          <p id={errorId} className="checkout-field__error">
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> {errors[name]}
          </p>
        ) : null}
        <input
          id={inputId}
          name={name}
          type="text"
          className="shop-input"
          value={values[name]}
          onChange={(event) => update(name, event.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          inputMode={field.inputMode}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        />
      </div>
    );
  };

  const errorList = FIELD_ORDER.filter((name) => errors[name]);

  return (
    <div className="site">
      <SiteHeader />
      <ShopBar current="checkout" />

      <main className="wrap shop-main">
        <section className="shop-intro">
          <h1>Checkout</h1>
          <p>
            Type where the shopping should be delivered, then pay with the <strong>Practice Bank Card</strong>. Take your
            time — no real money is used.
          </p>
        </section>

        {!hasMounted || submitting ? (
          <p className="shop-loading">{submitting ? "Placing your practice order…" : "Loading checkout…"}</p>
        ) : itemCount === 0 ? (
          <div className="shop-empty">
            <p className="shop-empty__icon" aria-hidden="true">🧺</p>
            <h2>Your basket is empty</h2>
            <p>You need something in your basket before you can check out.</p>
            <Link href="/shop/" className="btn btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back to the shop
            </Link>
          </div>
        ) : (
          <div className="basket-layout">
            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
              {errorList.length > 0 ? (
                <div className="checkout-errors" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                  <h2>Please check {errorList.length === 1 ? "1 thing" : `${errorList.length} things`}</h2>
                  <ul>
                    {errorList.map((name) => (
                      <li key={name}>
                        <a href={`#checkout-${name}`}>{FIELDS[name].label}</a>: {errors[name]}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <fieldset className="checkout-section">
                <legend>
                  <span className="checkout-section__num">1</span> Delivery details
                </legend>
                {renderField("fullName")}
                {renderField("addressLine1")}
                {renderField("addressLine2")}
                {renderField("townOrCity")}
                {renderField("postcode")}
              </fieldset>

              <fieldset className="checkout-section">
                <legend>
                  <span className="checkout-section__num">2</span> Payment
                </legend>
                <PracticeBankCard />
                {renderField("nameOnCard")}
                {renderField("cardNumber")}
                <div className="checkout-row">
                  {renderField("expiry")}
                  {renderField("cvv")}
                </div>
                <p className="checkout-safety">
                  <FontAwesomeIcon icon={faLock} aria-hidden="true" /> A real shop will <strong>never</strong> ask for your
                  4-digit PIN. If a website asks for it, stop.
                </p>
              </fieldset>

              <button type="submit" className="btn btn-primary checkout-submit">
                Place Practice Order
              </button>
              <Link href="/basket/" className="btn-text">
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Back to basket
              </Link>
            </form>

            <OrderSummary totals={totals} itemCount={itemCount} />
          </div>
        )}
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
