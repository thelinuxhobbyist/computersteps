"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import SiteHeader from "../components/SiteHeader";
import ShopBar from "../components/shop/ShopBar";
import OrderSummary from "../components/shop/OrderSummary";
import { clearBasket, savePracticeOrder, useBasket, useHasMounted, type PracticeOrder } from "../shop/basket-store";
import {
  formatCardNumberInput,
  formatCvvInput,
  formatExpiryInput,
  formatPrice,
  isPracticeCardNumber,
  validateCardDetails,
  validateCardFormat,
  validateDeliveryDetails,
  type CardDetails,
  type DeliveryDetails,
  type FieldErrors,
} from "../shop/shop-data";
import { payWithPracticeBank } from "../scenarios/practice-bank/bank-api";
import { BANK_BASE } from "../scenarios/practice-bank/bank-data";

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
  nameOnCard: { label: "Name on Card" },
  cardNumber: {
    label: "16-Digit Card Number",
    hint: "The long number on the front of the card. Just type the numbers. The spaces are added for you.",
    placeholder: "0000 0000 0000 0000",
    maxLength: 19,
    inputMode: "numeric",
  },
  expiry: {
    label: "Expiry Date (MM/YY)",
    hint: "Just type the numbers. The / is added for you.",
    placeholder: "MM/YY",
    maxLength: 5,
    inputMode: "numeric",
    narrow: true,
  },
  cvv: {
    label: "Security Code (CVV)",
    hint: "The last 3 numbers on the back of your card",
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
  const [paymentError, setPaymentError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingCard, setCheckingCard] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const update = (name: FieldName, rawValue: string) => {
    const value =
      name === "cardNumber"
        ? formatCardNumberInput(rawValue)
        : name === "expiry"
          ? formatExpiryInput(rawValue, values.expiry)
          : name === "cvv"
            ? formatCvvInput(rawValue)
            : rawValue;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const showErrors = (nextErrors: FieldErrors<FormValues>, nextPaymentError = "") => {
    setErrors(nextErrors);
    setPaymentError(nextPaymentError);
    requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  const placeOrder = (orderNumber: string, bankPayment?: PracticeOrder["bankPayment"]) => {
    setSubmitting(true);
    savePracticeOrder({
      orderNumber,
      placedAt: new Date().toISOString(),
      lines,
      delivery: {
        fullName: values.fullName.trim(),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2.trim(),
        townOrCity: values.townOrCity.trim(),
        postcode: values.postcode.trim().toUpperCase(),
      },
      bankPayment,
    });
    clearBasket();
    router.push("/checkout/success/");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkingCard) return;

    const usesPracticeCard = isPracticeCardNumber(values.cardNumber);
    const cardErrors = usesPracticeCard ? validateCardDetails(values) : validateCardFormat(values);
    const nextErrors: FieldErrors<FormValues> = { ...validateDeliveryDetails(values), ...cardErrors };
    if (Object.keys(nextErrors).length > 0) {
      showErrors(nextErrors);
      return;
    }

    const orderNumber = makeOrderNumber();
    if (usesPracticeCard) {
      placeOrder(orderNumber);
      return;
    }

    setCheckingCard(true);
    const details = {
      fullName: values.fullName,
      addressLine1: values.addressLine1,
      townOrCity: values.townOrCity,
      postcode: values.postcode,
      nameOnCard: values.nameOnCard,
      cardNumber: values.cardNumber,
      expiry: values.expiry,
      cvv: values.cvv,
    };
    const result = await payWithPracticeBank(details, totals.totalPence, orderNumber);
    setCheckingCard(false);

    if (result.ok) {
      placeOrder(orderNumber, { username: result.username, amountPence: totals.totalPence, balancePence: result.balancePence });
    } else if (result.reason === "card-not-found") {
      showErrors({ cardNumber: "We don't recognise this card number. Check each group of 4 numbers against your card." });
    } else if (result.reason === "card-details") {
      showErrors(result.errors);
    } else if (result.reason === "insufficient-funds") {
      showErrors(
        {},
        `Payment declined: there is not enough money in your Practice Bank account. Your balance is ${formatPrice(result.balancePence)}. Remove something from your basket and try again.`,
      );
    } else {
      showErrors({}, "We couldn't reach Practice Bank to take the payment. Check you are connected to the internet, then try again.");
    }
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
            Type where the shopping should be delivered, then enter your card details to pay.
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
              {paymentError ? (
                <div className="checkout-errors" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                  <h2>Your payment did not go through</h2>
                  <p>{paymentError}</p>
                </div>
              ) : errorList.length > 0 ? (
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
                <p className="checkout-section__intro">
                  Paying with a Practice Bank card? Use the name and address shown in Practice Bank under <strong>My card</strong>.
                  The bank checks they match the card.
                </p>
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
                <p className="checkout-section__intro">
                  Type the details exactly as they appear on your card. You can use your Practice Bank card or the practice card
                  you were given.{" "}
                  <Link href={`${BANK_BASE}/`} className="checkout-section__link">
                    No card? Open a Practice Bank account
                  </Link>{" "}
                  (your basket will be kept).
                </p>
                {renderField("nameOnCard")}
                {renderField("cardNumber")}
                <div className="checkout-row">
                  {renderField("expiry")}
                  {renderField("cvv")}
                </div>
              </fieldset>

              <button type="submit" className="btn btn-primary checkout-submit" disabled={checkingCard}>
                {checkingCard ? "Checking your card…" : "Place Practice Order"}
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
