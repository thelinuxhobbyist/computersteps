import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faHouse, faPhone, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import ContactForm from "./ContactForm";
import { ENERGY_BASE, OPENING_HOURS, WESTFORD } from "../energy-data";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <div className="we-wrap we-content">
      <h1>Contact us</h1>
      <p className="we-lead">
        Many questions are answered in{" "}
        <Link href={`${ENERGY_BASE}/help/`} className="we-link">
          Help &amp; Support
        </Link>
        . If you still need us, here is how to get in touch.
      </p>

      <div className="we-callout we-callout--urgent">
        <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />
        <p>
          <strong>Power cut?</strong> Call {WESTFORD.powerCutNumber}. <strong>Smell gas?</strong> Call {WESTFORD.gasEmergencyNumber}. Both are free, day and night.
        </p>
      </div>

      <div className="we-contact-grid">
        <section className="we-panel" aria-labelledby="we-phone-heading">
          <h2 id="we-phone-heading">
            <FontAwesomeIcon icon={faPhone} aria-hidden="true" /> Phone
          </h2>
          <dl className="we-details">
            <div>
              <dt>Customer service</dt>
              <dd>
                <a href={`tel:${WESTFORD.phone.replace(/\s/g, "")}`} className="we-phone">
                  {WESTFORD.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt>Pay a bill (automated, 24 hours)</dt>
              <dd>
                <a href={`tel:${WESTFORD.payLine.replace(/\s/g, "")}`} className="we-phone">
                  {WESTFORD.payLine}
                </a>
              </dd>
            </div>
          </dl>
          <h3>Customer service opening hours</h3>
          <table className="we-table we-table--compact">
            <tbody>
              {OPENING_HOURS.map((row) => (
                <tr key={row.day}>
                  <th scope="row">{row.day}</th>
                  <td>{row.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="we-small">
            Struggling to pay? Our Support Team has its own number.{" "}
            <Link href={`${ENERGY_BASE}/help/struggling-to-pay/`} className="we-link">
              See help with money worries
            </Link>
            .
          </p>
          <p className="we-small">If you have a hearing or speech difficulty, you can call us using Relay UK. Dial 18001 before our number.</p>
        </section>

        <section className="we-panel" aria-labelledby="we-write-heading">
          <h2 id="we-write-heading">
            <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /> Email or post
          </h2>
          <dl className="we-details">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${WESTFORD.email}`} className="we-link">
                  {WESTFORD.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Postal address</dt>
              <dd>
                <address>
                  {WESTFORD.addressLines.map((line) => (
                    <span key={line} className="we-address-line">
                      {line}
                    </span>
                  ))}
                </address>
              </dd>
            </div>
          </dl>
          <p className="we-small">Please include your account number. We reply to emails and letters within 5 working days.</p>
          <h3>
            <FontAwesomeIcon icon={faHouse} aria-hidden="true" /> Visiting us
          </h3>
          <p className="we-small">We don&rsquo;t have an office you can visit. The address above is for letters only.</p>
        </section>
      </div>

      <section className="we-section" aria-labelledby="we-message-heading">
        <h2 id="we-message-heading">Send us a message</h2>
        <p>Log in to send a message from your online account. We reply within 2 working days.</p>
        <ContactForm />
      </section>
    </div>
  );
}
