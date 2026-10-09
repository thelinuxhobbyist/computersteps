"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../../components/EnergyGate";
import { formatMoney } from "../../../practice-bank/bank-data";
import { ENERGY_BASE, PAYMENT_METHOD_LABELS, dayOf, formatDay } from "../../energy-data";

export default function PaymentHistory() {
  return (
    <EnergyGate>
      {(energy) => (
        <div className="we-wrap we-content">
          <Link href={`${ENERGY_BASE}/payments/`} className="we-back">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Payments
          </Link>
          <h1>Payment history</h1>
          <p className="we-lead">Every payment you have made to us, newest first.</p>
          <div className="we-table-wrap we-panel">
            <table className="we-table">
              <caption className="we-visually-hidden">Your payments</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">How you paid</th>
                  <th scope="col">Payment reference</th>
                </tr>
              </thead>
              <tbody>
                {energy.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDay(dayOf(payment.paidAt))}</td>
                    <td>{formatMoney(payment.amountPence)}</td>
                    <td>{PAYMENT_METHOD_LABELS[payment.method]}</td>
                    <td>{payment.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </EnergyGate>
  );
}
