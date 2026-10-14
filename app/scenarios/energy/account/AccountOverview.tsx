"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChartColumn, faCreditCard, faEnvelope, faFileInvoice, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../components/EnergyGate";
import { formatMoney } from "../../practice-bank/bank-data";
import { ENERGY_BASE, billStatusText, contactTopicLabel, dayOf, formatDay, formatPence, monthOf, ordinal, type EnergyAccount } from "../energy-data";

const TILES = [
  { href: `${ENERGY_BASE}/bills/`, icon: faFileInvoice, title: "Bills", text: "See your latest bill and older bills" },
  { href: `${ENERGY_BASE}/payments/`, icon: faCreditCard, title: "Payments", text: "Make a payment or change how you pay" },
  { href: `${ENERGY_BASE}/usage/`, icon: faChartColumn, title: "Energy Usage", text: "How much electricity you use each month" },
  { href: `${ENERGY_BASE}/contact/`, icon: faEnvelope, title: "Contact Us", text: "Phone, message or write to us" },
];

export default function AccountOverview() {
  return <EnergyGate>{(energy) => <Overview energy={energy} />}</EnergyGate>;
}

function Overview({ energy }: { energy: EnergyAccount }) {
  const [latest] = energy.bills;
  const owes = energy.balancePence > 0;

  return (
    <div className="we-wrap we-content">
      <h1>Welcome, {energy.fullName}</h1>
      <address className="we-customer-address">
        <span>{energy.addressLine1}</span>
        <span>{energy.townOrCity}</span>
        <span>{energy.postcode}</span>
      </address>

      {energy.billAttention ? (
        <div className="we-callout we-callout--urgent" role="alert">
          <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />
          <div>
            <p>
              <strong>URGENT: Your latest electricity bill requires attention. Please contact our customer support team to discuss your account.</strong>
            </p>
            <p>
              Read the latest bill, then send a message from Contact Us. The confirmation reference is saved on this account. No real email is sent.
            </p>
            <p>
              <Link href={`${ENERGY_BASE}/bills/`} className="we-link">
                View the latest bill
              </Link>
              {" · "}
              <Link href={`${ENERGY_BASE}/contact/`} className="we-link">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      <div className="we-account-grid">
        <section className={`we-balance ${owes ? "" : "is-clear"}`} aria-labelledby="we-balance-heading">
          <h2 id="we-balance-heading">Your balance</h2>
          {owes ? (
            <>
              <p className="we-balance__amount">{formatMoney(energy.balancePence)}</p>
              <p>to pay{latest && latest.status !== "paid" ? ` by ${formatDay(latest.dueOn)}` : ""}</p>
              {latest?.overdue ? <p className="we-balance__warning">This payment is overdue.</p> : null}
              <Link href={`${ENERGY_BASE}/payments/pay/`} className="we-btn we-btn--light">
                Pay now <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <p className="we-balance__amount">{formatMoney(Math.abs(energy.balancePence))}</p>
              <p>{energy.balancePence < 0 ? "in credit" : "Nothing to pay right now"}</p>
            </>
          )}
        </section>

        <section className="we-panel" aria-labelledby="we-details-heading">
          <h2 id="we-details-heading">Your account details</h2>
          <dl className="we-details">
            <div>
              <dt>Account number</dt>
              <dd>{energy.accountNumber}</dd>
            </div>
            <div>
              <dt>Supply</dt>
              <dd>Electricity</dd>
            </div>
            <div>
              <dt>Tariff</dt>
              <dd>
                {energy.tariffName}: {formatPence(energy.unitRatePence)} per kWh, standing charge {formatPence(energy.standingChargePence)} a
                day
              </dd>
            </div>
            <div>
              <dt>How you pay</dt>
              <dd>
                {energy.directDebit
                  ? `Direct Debit on the ${ordinal(energy.directDebit.day)} of each month`
                  : "You pay each bill when it arrives"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {latest ? (
        <section className="we-section" aria-labelledby="we-latest-heading">
          <div className="we-section__head">
            <h2 id="we-latest-heading">Latest bill</h2>
            <Link href={`${ENERGY_BASE}/bills/`} className="we-link">
              View bill
            </Link>
          </div>
          <div className="we-panel we-bill-line">
            <span>
              <strong>{monthOf(latest.periodStart)}</strong>
              <span>Sent {formatDay(latest.issuedOn)}</span>
            </span>
            <span className="we-bill-line__amount">{formatMoney(latest.amountPence)}</span>
            <span className={`we-status we-status--${latest.status}${latest.overdue ? " is-overdue" : ""}`}>{billStatusText(latest)}</span>
          </div>
        </section>
      ) : null}

      <ul className="we-tiles">
        {TILES.map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href} className="we-tile">
              <FontAwesomeIcon icon={tile.icon} aria-hidden="true" className="we-tile__icon" />
              <span>
                <strong>{tile.title}</strong>
                <span>{tile.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {energy.messages.length > 0 ? (
        <section className="we-section" aria-labelledby="we-messages-heading">
          <h2 id="we-messages-heading">Messages you have sent</h2>
          <ul className="we-list">
            {energy.messages.slice(0, 5).map((message) => (
              <li key={message.id} className="we-panel we-message">
                <strong>{contactTopicLabel(message.topic)}</strong>
                <span className="we-small">
                  Reference {message.reference}. Sent {formatDay(dayOf(message.sentAt))}. Status: {message.status === "replied" ? "reply saved" : "received"}.
                </span>
                <p>{message.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}