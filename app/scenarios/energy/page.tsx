import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faGaugeHigh, faHandHoldingHeart, faPlug, faShieldHalved, faSterlingSign } from "@fortawesome/free-solid-svg-icons";
import EnergyLogIn from "./EnergyLogIn";
import { ENERGY_BASE, WESTFORD } from "./energy-data";

export const metadata: Metadata = { title: "Home" };

const QUICK_LINKS = [
  { href: `${ENERGY_BASE}/payments/`, icon: faSterlingSign, title: "Pay a bill", text: "Pay online, by phone or by bank transfer" },
  { href: `${ENERGY_BASE}/usage/meter-reading/`, icon: faGaugeHigh, title: "Send a meter reading", text: "Help us get your bill right" },
  { href: `${ENERGY_BASE}/help/struggling-to-pay/`, icon: faHandHoldingHeart, title: "Worried about paying?", text: "We're here to help" },
  { href: `${ENERGY_BASE}/help/power-cut/`, icon: faPlug, title: "Power cut", text: "What to do and who to call" },
];

export default function EnergyHomePage() {
  return (
    <>
      <section className="we-hero">
        <div className="we-wrap we-hero__inner">
          <div>
            <h1>Electricity for Westford homes</h1>
            <p className="we-lead">Manage your account online: see your bills, make a payment and check how much energy you use.</p>
          </div>
          <EnergyLogIn />
        </div>
      </section>

      <div className="we-wrap we-content">
        <section aria-labelledby="we-quick-heading">
          <h2 id="we-quick-heading">How can we help today?</h2>
          <ul className="we-tiles">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="we-tile">
                  <FontAwesomeIcon icon={link.icon} aria-hidden="true" className="we-tile__icon" />
                  <span>
                    <strong>{link.title}</strong>
                    <span>{link.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="we-news" aria-labelledby="we-news-heading">
          <h2 id="we-news-heading">News</h2>
          <div className="we-news__grid">
            <article className="we-panel">
              <h3>
                <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" /> Watch out for scam emails
              </h3>
              <p>
                We will never email or text you asking for your password or full card details.{" "}
                <Link href={`${ENERGY_BASE}/help/scams/`} className="we-link">
                  How to spot a scam
                </Link>
              </p>
            </article>
            <article className="we-panel">
              <h3>
                <FontAwesomeIcon icon={faGaugeHigh} aria-hidden="true" /> Got an estimated bill?
              </h3>
              <p>
                Send us a meter reading and your next bill will be based on what you really used.{" "}
                <Link href={`${ENERGY_BASE}/help/meter-readings/`} className="we-link">
                  About meter readings
                </Link>
              </p>
            </article>
            <article className="we-panel">
              <h3>
                <FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" /> Questions about your bill?
              </h3>
              <p>
                Our help pages explain every part of your bill.{" "}
                <Link href={`${ENERGY_BASE}/help/understanding-your-bill/`} className="we-link">
                  Understanding your bill
                </Link>
              </p>
            </article>
          </div>
        </section>

        <p className="we-small">
          {WESTFORD.legalName} supplies electricity to homes in Westford and the surrounding villages.
        </p>
      </div>
    </>
  );
}
