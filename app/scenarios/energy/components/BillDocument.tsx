import Link from "next/link";
import { formatMoney } from "../../practice-bank/bank-data";
import { ENERGY_BASE, billStatusText, formatDay, formatPence, type EnergyAccount, type EnergyBill } from "../energy-data";

/** One bill, laid out like a paper bill. */
export default function BillDocument({ bill, energy, showPay }: { bill: EnergyBill; energy: EnergyAccount; showPay?: boolean }) {
  const left = bill.amountPence - bill.paidPence;

  return (
    <article className="we-bill" aria-label={`Bill ${bill.reference}`}>
      <header className="we-bill__head">
        <div>
          <p className="we-bill__title">Your electricity bill</p>
          <address className="we-bill__address">
            <span>{energy.fullName}</span>
            <span>{energy.addressLine1}</span>
            <span>{energy.townOrCity}</span>
            <span>{energy.postcode}</span>
          </address>
        </div>
        <dl className="we-bill__refs">
          <div>
            <dt>Bill reference</dt>
            <dd>{bill.reference}</dd>
          </div>
          <div>
            <dt>Bill date</dt>
            <dd>{formatDay(bill.issuedOn)}</dd>
          </div>
          <div>
            <dt>Account number</dt>
            <dd>{energy.accountNumber}</dd>
          </div>
        </dl>
      </header>

      <div className={`we-bill__due we-bill__due--${bill.status}`}>
        <div>
          <span>Amount of this bill</span>
          <strong>{formatMoney(bill.amountPence)}</strong>
        </div>
        <div>
          <span>Please pay by</span>
          <strong>{formatDay(bill.dueOn)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{billStatusText(bill)}</strong>
          {bill.status === "part-paid" ? <span>{formatMoney(left)} left to pay</span> : null}
        </div>
      </div>

      <p className="we-bill__period">
        This bill is for the electricity you used from <strong>{formatDay(bill.periodStart)}</strong> to{" "}
        <strong>{formatDay(bill.periodEnd)}</strong> ({bill.days} days).
      </p>

      <h3>Meter readings</h3>
      <div className="we-table-wrap">
        <table className="we-table">
          <caption className="we-visually-hidden">Meter readings for this bill</caption>
          <thead>
            <tr>
              <th scope="col">Meter</th>
              <th scope="col">Start reading</th>
              <th scope="col">End reading</th>
              <th scope="col">Units used</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{energy.meterSerial}</td>
              <td>{bill.openingReading} (actual)</td>
              <td>
                {bill.closingReading} ({bill.readingType})
              </td>
              <td>{bill.kwh} kWh</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Charges</h3>
      <div className="we-table-wrap">
        <table className="we-table we-table--charges">
          <caption className="we-visually-hidden">How this bill is worked out</caption>
          <tbody>
            <tr>
              <th scope="row">Electricity used</th>
              <td>
                {bill.kwh} kWh × {formatPence(bill.unitRatePence)}
              </td>
              <td>{formatMoney(bill.energyChargePence)}</td>
            </tr>
            <tr>
              <th scope="row">Standing charge</th>
              <td>
                {bill.days} days × {formatPence(bill.standingChargePence)}
              </td>
              <td>{formatMoney(bill.standingTotalPence)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td />
              <td>{formatMoney(bill.amountPence)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="we-small">Prices include VAT at 5%.</p>

      {bill.readingType === "estimated" ? (
        <p className="we-callout">
          <strong>This bill uses an estimated reading.</strong> We guessed how much electricity you used.{" "}
          <Link href={`${ENERGY_BASE}/usage/meter-reading/`} className="we-link">
            Send us a meter reading
          </Link>{" "}
          so your next bill is right.
        </p>
      ) : null}

      {showPay && bill.status !== "paid" && energy.balancePence > 0 ? (
        <Link href={`${ENERGY_BASE}/payments/pay/`} className="we-btn we-btn--primary">
          Pay this bill
        </Link>
      ) : null}
    </article>
  );
}
