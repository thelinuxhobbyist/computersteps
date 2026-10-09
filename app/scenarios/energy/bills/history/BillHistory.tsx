"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import BillDocument from "../../components/BillDocument";
import EnergyGate from "../../components/EnergyGate";
import { formatMoney } from "../../../practice-bank/bank-data";
import { ENERGY_BASE, billStatusText, formatDay, monthOf } from "../../energy-data";

export default function BillHistory() {
  return (
    <EnergyGate>
      {(energy) => (
        <div className="we-wrap we-content">
          <Link href={`${ENERGY_BASE}/bills/`} className="we-back">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Latest bill
          </Link>
          <h1>Previous bills</h1>
          <p className="we-lead">All your bills, newest first. Open a bill to see the details.</p>
          <ul className="we-list">
            {energy.bills.map((bill) => (
              <li key={bill.id}>
                <details className="we-bill-row">
                  <summary>
                    <span>
                      <strong>{monthOf(bill.periodStart)}</strong>
                      <span>Bill date {formatDay(bill.issuedOn)}</span>
                    </span>
                    <span className="we-bill-row__amount">{formatMoney(bill.amountPence)}</span>
                    <span className={`we-status we-status--${bill.status}${bill.overdue ? " is-overdue" : ""}`}>{billStatusText(bill)}</span>
                    <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" className="we-bill-row__chevron" />
                  </summary>
                  <BillDocument bill={bill} energy={energy} />
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </EnergyGate>
  );
}
