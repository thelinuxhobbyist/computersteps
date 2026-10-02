"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload, faEye } from "@fortawesome/free-solid-svg-icons";
import AccountGate from "../components/AccountGate";
import { buildStatements, formatMoney, formatShortDate, statementFileName, type BankAccount, type Statement } from "../bank-data";
import { downloadStatementPdf } from "../statement-pdf";

export default function Statements() {
  return <AccountGate>{(account) => <StatementList account={account} />}</AccountGate>;
}

function StatementList({ account }: { account: BankAccount }) {
  const statements = buildStatements(account, new Date());
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const open = statements.find((statement) => statement.key === openKey);

  useEffect(() => {
    if (!hasNavigated.current) return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [openKey]);

  const show = (key: string | null) => {
    hasNavigated.current = true;
    setOpenKey(key);
  };

  const download = (statement: Statement) => {
    const fileName = statementFileName(statement);
    downloadStatementPdf(account, statement, fileName);
    setDownloaded(fileName);
  };

  const downloadedNote = downloaded ? (
    <p className="pb-downloaded" role="status">
      Downloaded <strong>{downloaded}</strong>. You will find it in your Downloads folder.
    </p>
  ) : null;

  if (open) {
    return (
      <div className="pb-wrap pb-content">
        <button type="button" className="pb-back" onClick={() => show(null)}>
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> All statements
        </button>
        <h1 ref={headingRef} tabIndex={-1}>
          Statement: {open.title}
        </h1>
        <p className="pb-lead">
          {account.username} · Sort code {account.sortCode} · Account number {account.accountNumber}
        </p>

        <dl className="pb-statement-summary">
          <div>
            <dt>Opening balance</dt>
            <dd>{formatMoney(open.openingBalancePence)}</dd>
          </div>
          <div>
            <dt>Money in</dt>
            <dd className="is-in">{formatMoney(open.inPence)}</dd>
          </div>
          <div>
            <dt>Money out</dt>
            <dd>{formatMoney(open.outPence)}</dd>
          </div>
          <div>
            <dt>{open.isCurrentMonth ? "Balance now" : "Closing balance"}</dt>
            <dd>{formatMoney(open.closingBalancePence)}</dd>
          </div>
        </dl>

        <div className="pb-actions">
          <button type="button" className="pb-btn pb-btn--primary" onClick={() => download(open)}>
            <FontAwesomeIcon icon={faDownload} aria-hidden="true" /> Download as PDF
          </button>
        </div>
        {downloadedNote}

        <div className="pb-table-wrap">
          <table className="pb-table">
            <caption className="pb-visually-hidden">Transactions in {open.title}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col" className="is-number">
                  Money out
                </th>
                <th scope="col" className="is-number">
                  Money in
                </th>
                <th scope="col" className="is-number">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {open.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatShortDate(transaction.postedAt)}</td>
                  <td>
                    {transaction.description}
                    {transaction.reference ? <span className="pb-table__ref"> {transaction.reference}</span> : null}
                  </td>
                  <td className="is-number">{transaction.amountPence < 0 ? formatMoney(-transaction.amountPence) : ""}</td>
                  <td className="is-number is-in">{transaction.amountPence > 0 ? formatMoney(transaction.amountPence) : ""}</td>
                  <td className="is-number">{formatMoney(transaction.balanceAfterPence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-wrap pb-content">
      <h1 ref={headingRef} tabIndex={-1}>
        Statements
      </h1>
      <p className="pb-lead">A statement lists everything that went in and out of your account in one month.</p>
      {downloadedNote}

      <ul className="pb-statements">
        {statements.map((statement) => (
          <li key={statement.key} className="pb-statement">
            <div className="pb-statement__info">
              <strong>{statement.title}</strong>
              <span>
                Money in {formatMoney(statement.inPence)} · Money out {formatMoney(statement.outPence)}
              </span>
            </div>
            <div className="pb-statement__actions">
              <button type="button" className="pb-btn pb-btn--secondary" onClick={() => show(statement.key)}>
                <FontAwesomeIcon icon={faEye} aria-hidden="true" /> View<span className="pb-visually-hidden"> {statement.title}</span>
              </button>
              <button type="button" className="pb-btn pb-btn--secondary" onClick={() => download(statement)}>
                <FontAwesomeIcon icon={faDownload} aria-hidden="true" /> Download PDF
                <span className="pb-visually-hidden"> for {statement.title}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
