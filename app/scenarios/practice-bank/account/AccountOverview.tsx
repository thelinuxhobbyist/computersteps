"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBasketShopping, faCreditCard, faFileLines, faListUl } from "@fortawesome/free-solid-svg-icons";
import AccountGate from "../components/AccountGate";
import TransactionList from "../components/TransactionList";
import { BANK_BASE, filterTransactions, formatMoney, totals, withRunningBalance, type BankAccount } from "../bank-data";

const LINKS = [
  { href: `${BANK_BASE}/transactions/`, icon: faListUl, title: "Transactions", text: "Find a payment and see what you have spent" },
  { href: `${BANK_BASE}/card/`, icon: faCreditCard, title: "My card", text: "See your card number, expiry date and security code" },
  { href: `${BANK_BASE}/statements/`, icon: faFileLines, title: "Statements", text: "View or download a statement for each month" },
];

export default function AccountOverview() {
  return <AccountGate>{(account) => <Overview account={account} />}</AccountGate>;
}

function Overview({ account }: { account: BankAccount }) {
  const transactions = withRunningBalance(account);
  const thisMonth = filterTransactions(transactions, { period: "this-month", now: new Date() });
  const { outPence } = totals(thisMonth);
  const recent = transactions.slice(-5);

  return (
    <div className="pb-wrap pb-content">
      <h1>Hello, {account.username}</h1>

      <section className="pb-balance" aria-labelledby="pb-balance-heading">
        <div>
          <h2 id="pb-balance-heading">Current Account</h2>
          <p className="pb-balance__numbers">
            Sort code {account.sortCode} · Account number {account.accountNumber}
          </p>
        </div>
        <div className="pb-balance__amount">
          <span>Balance</span>
          <strong>{formatMoney(account.balancePence)}</strong>
        </div>
        <p className="pb-balance__spent">
          Money out this month: <strong>{formatMoney(outPence)}</strong>
        </p>
      </section>

      <ul className="pb-tiles">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="pb-tile">
              <FontAwesomeIcon icon={link.icon} aria-hidden="true" className="pb-tile__icon" />
              <span>
                <strong>{link.title}</strong>
                <span>{link.text}</span>
              </span>
              <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="pb-tile__arrow" />
            </Link>
          </li>
        ))}
      </ul>

      <section className="pb-section" aria-labelledby="pb-recent-heading">
        <div className="pb-section__head">
          <h2 id="pb-recent-heading">Latest transactions</h2>
          <Link href={`${BANK_BASE}/transactions/`} className="pb-link">
            See all transactions
          </Link>
        </div>
        <TransactionList transactions={recent} />
      </section>

      <aside className="pb-shop-callout">
        <FontAwesomeIcon icon={faBasketShopping} aria-hidden="true" className="pb-shop-callout__icon" />
        <p>
          <strong>Try your card.</strong> Buy something in the Practice Shop, then come back here to find the payment.
        </p>
        <Link href="/shop/" className="pb-btn pb-btn--secondary">
          Go to the Practice Shop
        </Link>
      </aside>
    </div>
  );
}
