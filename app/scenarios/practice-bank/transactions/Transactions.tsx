"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import AccountGate from "../components/AccountGate";
import TransactionList from "../components/TransactionList";
import {
  PERIODS,
  filterTransactions,
  formatMoney,
  periodDescription,
  totals,
  withRunningBalance,
  type BankAccount,
  type PeriodId,
} from "../bank-data";

export default function Transactions() {
  return <AccountGate>{(account) => <TransactionFinder account={account} />}</AccountGate>;
}

function TransactionFinder({ account }: { account: BankAccount }) {
  const [period, setPeriod] = useState<PeriodId>("this-month");
  const [query, setQuery] = useState("");
  const now = new Date();
  const shown = filterTransactions(withRunningBalance(account), { period, query, now });
  const { inPence, outPence } = totals(shown);

  return (
    <div className="pb-wrap pb-content">
      <h1>Transactions</h1>
      <p className="pb-lead">
        Your balance is <strong>{formatMoney(account.balancePence)}</strong>. Choose a time period, or search for a payment.
      </p>

      <div className="pb-filters">
        <fieldset className="pb-periods">
          <legend className="pb-label">Show</legend>
          <div className="pb-periods__options">
            {PERIODS.map((item) => (
              <label key={item.id} className={`pb-period ${period === item.id ? "is-active" : ""}`}>
                <input type="radio" name="period" value={item.id} checked={period === item.id} onChange={() => setPeriod(item.id)} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="pb-field pb-search">
          <label htmlFor="pb-search" className="pb-label">
            Search
          </label>
          <p id="pb-search-hint" className="pb-hint">
            Type a shop name, a type of payment or an amount. For example: Practice Shop
          </p>
          <div className="pb-search__field">
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              id="pb-search"
              type="search"
              className="pb-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              aria-describedby="pb-search-hint"
            />
          </div>
        </div>
      </div>

      <section className="pb-period-summary" aria-live="polite" aria-label="Summary">
        <p className="pb-period-summary__range">{periodDescription(period, now)}</p>
        <dl>
          <div>
            <dt>Money in</dt>
            <dd className="is-in">{formatMoney(inPence)}</dd>
          </div>
          <div>
            <dt>Money out</dt>
            <dd>{formatMoney(outPence)}</dd>
          </div>
          <div>
            <dt>Transactions</dt>
            <dd>{shown.length}</dd>
          </div>
        </dl>
      </section>

      {shown.length > 0 ? (
        <TransactionList transactions={shown} />
      ) : (
        <div className="pb-panel pb-empty">
          <p>
            No transactions found {query.trim() ? <>for &ldquo;{query.trim()}&rdquo; </> : null}in this time period.
          </p>
          {query.trim() ? <p>Check the spelling, or choose a longer time period.</p> : null}
        </div>
      )}
    </div>
  );
}
