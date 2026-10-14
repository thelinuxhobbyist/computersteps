import type { Metadata } from "next";
import Link from "next/link";
import { COUNCIL_BASE, COUNCIL_NAV } from "./council-data";
import ResidentSummary from "./ResidentSummary";

export const metadata: Metadata = {
  title: "Westford Council",
  description: "A fictional local authority website for practising everyday online tasks.",
};

export default function CouncilHomePage() {
  return (
    <>
      <section className="council-hero">
        <div className="council-wrap council-hero__content">
          <div>
            <p className="council-date">Resident services</p>
            <h1>Manage your home, bills and local services online</h1>
            <p>
              Find council information, check your Council Tax, report a problem, ask for help and keep up with your requests in one place.
            </p>
            <div className="council-hero-actions">
              <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
                Go to My Account
              </Link>
              <Link href={`${COUNCIL_BASE}/council-tax/`} className="council-btn council-btn--secondary">
                View your Council Tax
              </Link>
            </div>
          </div>

          <div className="council-panel">
            <h2>Quick links</h2>
            <ul className="council-list">
              {COUNCIL_NAV.slice(1, 8).map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="council-wrap council-section">
        <section aria-labelledby="services-heading">
          <div className="council-section" style={{ paddingTop: 0 }}>
            <h2 id="services-heading">Popular services</h2>
            <div className="council-grid">
              <Link href={`${COUNCIL_BASE}/council-tax/`} className="council-card">
                <h3>Council Tax</h3>
                <p>Check your bill, due date and payment plan.</p>
              </Link>
              <Link href={`${COUNCIL_BASE}/bins/`} className="council-card">
                <h3>Bins &amp; Recycling</h3>
                <p>Find your collection day and report a missed collection.</p>
              </Link>
              <Link href={`${COUNCIL_BASE}/report/`} className="council-card">
                <h3>Report a Problem</h3>
                <p>Let the council know about a pothole, broken light or fly-tipping.</p>
              </Link>
              <Link href={`${COUNCIL_BASE}/contact/`} className="council-card">
                <h3>Contact Us</h3>
                <p>Send a message and track your enquiry through your account.</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="council-section" aria-labelledby="resident-heading">
          <h2 id="resident-heading">Resident account</h2>
          <div className="council-split">
            <ResidentSummary />
            <div className="council-panel">
              <h3>Useful to know</h3>
              <p>Most council services are available without visiting the town hall. You can log in with your existing Computer Steps account.</p>
              <div className="council-actions">
                <Link href={`${COUNCIL_BASE}/account/`} className="council-btn council-btn--primary">
                  Open account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
