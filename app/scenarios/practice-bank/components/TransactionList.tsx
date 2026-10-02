import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { formatDate, formatMoney, formatSignedMoney, formatTime, groupByDay, type TransactionWithBalance } from "../bank-data";

/** Newest first, grouped by day. Each row opens to show the full details. */
export default function TransactionList({ transactions }: { transactions: TransactionWithBalance[] }) {
  const groups = groupByDay([...transactions].reverse());

  return (
    <div className="pb-transactions">
      {groups.map((group) => (
        <section key={group.day} className="pb-day" aria-label={group.label}>
          <h3 className="pb-day__heading">{group.label}</h3>
          <ul className="pb-day__list">
            {group.transactions.map((transaction) => (
              <li key={transaction.id}>
                <details className="pb-transaction">
                  <summary>
                    <span className="pb-transaction__name">
                      <strong>{transaction.description}</strong>
                      <span>{transaction.type}</span>
                    </span>
                    <span className={`pb-transaction__amount ${transaction.amountPence > 0 ? "is-in" : ""}`}>
                      {formatSignedMoney(transaction.amountPence)}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" className="pb-transaction__chevron" />
                  </summary>
                  <dl className="pb-transaction__details">
                    <div>
                      <dt>Date</dt>
                      <dd>
                        {formatDate(transaction.postedAt)} at {formatTime(transaction.postedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Type</dt>
                      <dd>{transaction.type}</dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd>{transaction.category}</dd>
                    </div>
                    {transaction.reference ? (
                      <div>
                        <dt>Reference</dt>
                        <dd>{transaction.reference}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>{transaction.amountPence > 0 ? "Money in" : "Money out"}</dt>
                      <dd>{formatMoney(Math.abs(transaction.amountPence))}</dd>
                    </div>
                    <div>
                      <dt>Balance after</dt>
                      <dd>{formatMoney(transaction.balanceAfterPence)}</dd>
                    </div>
                  </dl>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
