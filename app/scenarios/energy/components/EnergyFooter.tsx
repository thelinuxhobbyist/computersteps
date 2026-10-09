import Link from "next/link";
import { ENERGY_BASE, WESTFORD } from "../energy-data";

const LINKS = [
  { href: `${ENERGY_BASE}/help/ways-to-pay/`, label: "Ways to pay" },
  { href: `${ENERGY_BASE}/help/struggling-to-pay/`, label: "Help if you're struggling to pay" },
  { href: `${ENERGY_BASE}/help/power-cut/`, label: "Power cuts" },
  { href: `${ENERGY_BASE}/help/scams/`, label: "Scams and staying safe" },
];

export default function EnergyFooter() {
  return (
    <footer className="we-footer">
      <div className="we-wrap we-footer__grid">
        <div>
          <h2>{WESTFORD.name}</h2>
          <p>Electricity for homes in and around Westford.</p>
        </div>
        <div>
          <h2>Popular help</h2>
          <ul>
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Power cut?</h2>
          <p>
            Call <strong>{WESTFORD.powerCutNumber}</strong>, free, day or night.
          </p>
        </div>
      </div>
      <div className="we-footer__legal">
        <div className="we-wrap">
          <p>
            © {WESTFORD.legalName}. A fictional company created for practising digital skills with Computer Steps. Accounts that
            are not used for 12 months are closed automatically.
          </p>
        </div>
      </div>
    </footer>
  );
}
