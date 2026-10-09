"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import BillDocument from "../components/BillDocument";
import EnergyGate from "../components/EnergyGate";
import { ENERGY_BASE } from "../energy-data";

export default function LatestBill() {
  return (
    <EnergyGate>
      {(energy) => (
        <div className="we-wrap we-content">
          <h1>Your latest bill</h1>
          <p className="we-lead">We send a bill every month for the electricity you used the month before.</p>
          {energy.bills[0] ? <BillDocument bill={energy.bills[0]} energy={energy} showPay /> : <p>You don&rsquo;t have any bills yet.</p>}
          <p className="we-more">
            <Link href={`${ENERGY_BASE}/bills/history/`} className="we-btn we-btn--secondary">
              <FontAwesomeIcon icon={faClockRotateLeft} aria-hidden="true" /> Previous bills
            </Link>
          </p>
        </div>
      )}
    </EnergyGate>
  );
}
