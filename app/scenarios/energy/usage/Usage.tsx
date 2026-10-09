"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";
import EnergyGate from "../components/EnergyGate";
import { formatMoney } from "../../practice-bank/bank-data";
import { ENERGY_BASE, formatDay, monthOf, type EnergyAccount, type EnergyReading } from "../energy-data";

const SOURCE_LABELS: Record<EnergyReading["source"], string> = {
  customer: "Sent by you",
  "meter-reader": "Meter reader",
  estimated: "Estimated by us",
};

export default function Usage() {
  return <EnergyGate>{(energy) => <UsageView energy={energy} />}</EnergyGate>;
}

function UsageView({ energy }: { energy: EnergyAccount }) {
  const months = [...energy.bills].reverse();
  const most = Math.max(...months.map((bill) => bill.kwh), 1);

  return (
    <div className="we-wrap we-content">
      <h1>Energy usage</h1>
      <p className="we-lead">How much electricity you have used each month, in kWh (units).</p>

      <section className="we-panel" aria-labelledby="we-chart-heading">
        <h2 id="we-chart-heading">Electricity used each month</h2>
        <ul className="we-chart" aria-hidden="true">
          {months.map((bill) => (
            <li key={bill.id}>
              <span className="we-chart__label">{monthOf(bill.periodStart).split(" ")[0].slice(0, 3)}</span>
              <span className="we-chart__track">
                <span className="we-chart__bar" style={{ width: `${(bill.kwh / most) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
        <div className="we-table-wrap">
          <table className="we-table">
            <caption className="we-visually-hidden">Electricity used each month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Electricity used</th>
                <th scope="col">Bill</th>
              </tr>
            </thead>
            <tbody>
              {months.map((bill) => (
                <tr key={bill.id}>
                  <td>{monthOf(bill.periodStart)}</td>
                  <td>{bill.kwh} kWh</td>
                  <td>{formatMoney(bill.amountPence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="we-section" aria-labelledby="we-meter-heading">
        <div className="we-section__head">
          <h2 id="we-meter-heading">Your meter</h2>
          <Link href={`${ENERGY_BASE}/usage/meter-reading/`} className="we-btn we-btn--primary">
            <FontAwesomeIcon icon={faGaugeHigh} aria-hidden="true" /> Send a meter reading
          </Link>
        </div>
        <dl className="we-details we-panel">
          <div>
            <dt>Meter serial number</dt>
            <dd>{energy.meterSerial}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>Electricity meter, single rate</dd>
          </div>
        </dl>

        <h3>Meter readings</h3>
        <div className="we-table-wrap we-panel">
          <table className="we-table">
            <caption className="we-visually-hidden">Meter readings, newest first</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Reading</th>
                <th scope="col">Type</th>
              </tr>
            </thead>
            <tbody>
              {energy.readings.map((reading) => (
                <tr key={reading.id}>
                  <td>{formatDay(reading.readOn)}</td>
                  <td>{reading.reading}</td>
                  <td>{SOURCE_LABELS[reading.source]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
