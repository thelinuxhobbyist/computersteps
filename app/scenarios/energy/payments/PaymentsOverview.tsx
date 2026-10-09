"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBuildingColumns, faCreditCard, faPhone, faRotate } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../components/EnergyGate";
import { formatMoney } from "../../practice-bank/bank-data";
import { ENERGY_BASE, PAYMENT_METHOD_LABELS, dayOf, formatDay, ordinal, type EnergyAccount } from "../energy-data";

export default function PaymentsOverview() {
  return <EnergyGate>{(energy) => <Overview energy={energy} />}</EnergyGate>;
}

function Overview({ energy }: { energy: EnergyAccount }) {
  const owes = energy.balancePence > 0;
  const [latest] = energy.bills;

  return (
    <div className="we-wrap we-content">
      <h1>Payments</h1>

      <div className="we-account-grid">
        <section className={`we-balance ${owes ? "" : "is-clear"}`} aria-labelledby="we-pay-heading">
          <h2 id="we-pay-heading">Amount to pay</h2>
          <p className="we-balance__amount">{formatMoney(Math.max(energy.balancePence, 0))}</p>
          {owes && latest && latest.status !== "paid" ? <p>Please pay by {formatDay(latest.dueOn)}</p> : <p>You have nothing to pay right now.</p>}
          {owes ? (
            <Link href={`${ENERGY_BASE}/payments/pay/`} className="we-btn we-btn--light">
              Pay now <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>
          ) : null}
        </section>

        <section className="we-panel" aria-labelledby="we-how-heading">
          <h2 id="we-how-heading">How you pay</h2>
          {energy.directDebit ? (
            <p>
              You pay by <strong>Direct Debit</strong> on the {ordinal(energy.directDebit.day)} of each month, from the account ending{" "}
              {energy.directDebit.accountNumberEnding}.
            </p>
          ) : (
            <p>You pay each bill yourself when it arrives. You don&rsquo;t have a Direct Debit.</p>
          )}
          <Link href={`${ENERGY_BASE}/payments/direct-debit/`} className="we-link">
            {energy.directDebit ? "Manage your Direct Debit" : "Set up a Direct Debit"}
          </Link>
        </section>
      </div>

      <section className="we-section" aria-labelledby="we-ways-heading">
        <h2 id="we-ways-heading">Other ways to pay</h2>
        <ul className="we-ways">
          <li>
            <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" />
            <span>
              <strong>Online</strong> with a debit card, any time.
            </span>
          </li>
          <li>
            <FontAwesomeIcon icon={faRotate} aria-hidden="true" />
            <span>
              <strong>Direct Debit</strong>, so your bill is paid automatically.
            </span>
          </li>
          <li>
            <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
            <span>
              <strong>By phone</strong>, using our automated payment line.
            </span>
          </li>
          <li>
            <FontAwesomeIcon icon={faBuildingColumns} aria-hidden="true" />
            <span>
              <strong>Bank transfer</strong> from your bank.
            </span>
          </li>
        </ul>
        <Link href={`${ENERGY_BASE}/help/ways-to-pay/`} className="we-link">
          Details of all the ways to pay
        </Link>
      </section>

      <section className="we-section" aria-labelledby="we-recent-heading">
        <div className="we-section__head">
          <h2 id="we-recent-heading">Recent payments</h2>
          <Link href={`${ENERGY_BASE}/payments/history/`} className="we-link">
            See all payments
          </Link>
        </div>
        <ul className="we-list">
          {energy.payments.slice(0, 3).map((payment) => (
            <li key={payment.id} className="we-panel we-bill-line">
              <span>
                <strong>{formatDay(dayOf(payment.paidAt))}</strong>
                <span>{PAYMENT_METHOD_LABELS[payment.method]}</span>
              </span>
              <span className="we-bill-line__amount">{formatMoney(payment.amountPence)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
