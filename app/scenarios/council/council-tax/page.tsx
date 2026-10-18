"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatMoney } from "../../practice-bank/bank-data";
import { payCouncilInstalment } from "../council-api";
import { COUNCIL_BASE, formatCouncilDate } from "../council-data";
import { CouncilGate } from "../council-session";
import type { CouncilAccount } from "../../../../workers/practice-bank/src/shared/council-types";

export default function CouncilTaxPage() {
  return <CouncilGate>{(account, replace) => <TaxContent account={account} replace={replace} />}</CouncilGate>;
}

function TaxContent({ account, replace }: { account: CouncilAccount; replace: (account: CouncilAccount) => void }) {
  const next = account.bills.find((bill) => bill.status !== "paid") ?? null;
  const [problem, setProblem] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<{ reference: string; amountPence: number; balancePence: number | null } | null>(null);
  const attempt = useRef<string | null>(null);

  const pay = async () => {
    if (paying || !next) return;
    if (!attempt.current) attempt.current = crypto.randomUUID();
    setPaying(true);
    const result = await payCouncilInstalment(account.username, attempt.current);
    setPaying(false);
    if (result.ok) {
      replace(result.council);
      setDone({ reference: result.reference, amountPence: result.amountPence, balancePence: result.balancePence });
      setProblem("");
      return;
    }
    if (result.reason === "insufficient-funds") {
      setProblem(`Westford Bank declined this payment. The balance is ${formatMoney(result.balancePence)}, which is not enough for this instalment.`);
      return;
    }
    if (result.reason === "nothing-to-pay") {
      if (result.council) replace(result.council);
      setProblem("There is no council tax instalment left to pay.");
      return;
    }
    setProblem("We couldn't take the payment. Check your connection, then try again. You will not be charged twice for this attempt.");
  };

  return (
    <div className="council-wrap council-section">
      <h1>Council Tax</h1>
      {next ? (
        <div className="council-warning">
          <h2>Bill ready</h2>
          <p>
            Instalment {next.instalmentNumber} of {next.instalmentsTotal} is {formatMoney(next.amountPence)} and is due on {formatCouncilDate(next.dueOn)}.
          </p>
        </div>
      ) : (
        <div className="council-success">This council tax instalment is paid.</div>
      )}

      <div className="council-account-grid">
        <section className="council-panel">
          <h2>Current bill</h2>
          <p>
            <strong>Council Tax reference:</strong> {account.councilTaxReference}
          </p>
          <p>
            <strong>Band:</strong> {account.councilTaxBand}
          </p>
          {next ? (
            <>
              <p>
                <strong>Bill reference:</strong> {next.reference}
              </p>
              <p>
                <strong>Year:</strong> {next.yearLabel}
              </p>
              <p>
                <strong>Amount due:</strong> {formatMoney(next.amountPence)}
              </p>
              <p>
                <strong>Due date:</strong> {formatCouncilDate(next.dueOn)}
              </p>
            </>
          ) : (
            <p>Nothing is due on this account right now.</p>
          )}
        </section>

        <section className="council-panel">
          <h2>Payment history</h2>
          {account.payments.length === 0 ? (
            <p>No council tax payments yet.</p>
          ) : (
            <ul className="council-list">
              {account.payments.map((item) => (
                <li key={item.id}>
                  <strong>{formatCouncilDate(item.paidAt.slice(0, 10))}</strong> — {formatMoney(item.amountPence)} — {item.reference}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="council-section">
        <h2>Pay with Westford Bank</h2>
        <p>This uses the same pretend balance as Westford Energy and Westford Foods. No card number is stored by the council.</p>
        {done ? (
          <div className="council-success" role="status">
            Payment received. You paid {formatMoney(done.amountPence)}. Reference <strong>{done.reference}</strong>.
            {done.balancePence !== null ? ` Your Westford Bank balance is now ${formatMoney(done.balancePence)}.` : ""}
          </div>
        ) : null}
        {problem ? (
          <p className="council-error" role="alert">
            {problem}
          </p>
        ) : null}
        {next && !done ? (
          <button type="button" className="council-button council-button--primary" onClick={pay} disabled={paying}>
            {paying ? "Paying…" : `Pay ${formatMoney(next.amountPence)}`}
          </button>
        ) : null}
      </section>

      <div className="council-actions" style={{ marginTop: "24px" }}>
        <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
          Back to My Account
        </Link>
      </div>
    </div>
  );
}
