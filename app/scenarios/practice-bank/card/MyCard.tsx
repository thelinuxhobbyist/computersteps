"use client";

import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";
import AccountGate from "../components/AccountGate";
import AddressLines from "../components/AddressLines";
import BankCard from "../components/BankCard";
import { formatCardNumber, maskCardNumber, type BankAccount } from "../bank-data";

export default function MyCard() {
  return <AccountGate>{(account) => <CardDetails account={account} />}</AccountGate>;
}

function CardDetails({ account }: { account: BankAccount }) {
  const [revealed, setRevealed] = useState(false);
  const hidden = <span className="pb-hidden-value">Hidden</span>;

  return (
    <div className="pb-wrap pb-content">
      <h1>My card</h1>
      <p className="pb-lead">
        Your Practice Bank debit card. Use these details, with your name and address below, to pay in the Practice Shop.
      </p>

      <div className="pb-card-layout">
        <section className="pb-panel" aria-labelledby="pb-card-details-heading">
          <h2 id="pb-card-details-heading">Card details</h2>
          <dl className="pb-details pb-details--large" aria-live="polite">
            <div>
              <dt>Name on card</dt>
              <dd>{account.nameOnCard}</dd>
            </div>
            <div>
              <dt>Card number</dt>
              <dd>{revealed ? formatCardNumber(account.cardNumber) : <span aria-label={`Hidden. Ends in ${account.cardNumber.slice(-4)}`}>{maskCardNumber(account.cardNumber)}</span>}</dd>
            </div>
            <div>
              <dt>Expiry date</dt>
              <dd>{revealed ? account.expiry : hidden}</dd>
            </div>
            <div>
              <dt>Security code</dt>
              <dd>{revealed ? account.cvv : hidden}</dd>
            </div>
          </dl>

          <button type="button" className="pb-btn pb-btn--primary" onClick={() => setRevealed((value) => !value)} aria-pressed={revealed}>
            <FontAwesomeIcon icon={revealed ? faEyeSlash : faEye} aria-hidden="true" />
            {revealed ? "Hide card details" : "Show card details"}
          </button>
        </section>

        <BankCard account={account} revealed={revealed} />
      </div>

      <section className="pb-panel pb-holder" aria-labelledby="pb-holder-heading">
        <h2 id="pb-holder-heading">Your name and address</h2>
        <p>
          This is the pretend person the card belongs to. When you pay in the Practice Shop, type this name and address as the
          delivery details.
        </p>
        <dl className="pb-details pb-details--large">
          <div>
            <dt>Full name</dt>
            <dd>{account.fullName}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>
              <AddressLines account={account} />
            </dd>
          </div>
        </dl>
      </section>

      <div className="pb-tip" role="note">
        <FontAwesomeIcon icon={faLock} aria-hidden="true" className="pb-tip__icon" />
        <p>
          <strong>Keeping a real card safe:</strong> only show your card details when nobody can see your screen, and hide them again
          when you have finished. A real bank will never ask you for your card details or PIN by phone, text or email.
        </p>
      </div>

      <div className="pb-actions">
        <Link href="/shop/" className="pb-btn pb-btn--secondary">
          Use my card in the Practice Shop
        </Link>
      </div>
    </div>
  );
}
