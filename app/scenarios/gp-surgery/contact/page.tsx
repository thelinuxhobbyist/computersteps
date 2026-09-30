import type { Metadata } from "next";
import Link from "next/link";
import GpPageHeader from "../components/GpPageHeader";
import OpeningHoursTable from "../components/OpeningHoursTable";
import UrgentHelp from "../components/UrgentHelp";
import { EXTENDED_HOURS, GP_BASE, SURGERY } from "../surgery-data";

export const metadata: Metadata = { title: "Contact and opening hours" };

export default function ContactPage() {
  return (
    <>
      <GpPageHeader title="Contact and opening hours">
        <p>How to get in touch with the surgery, when we are open, and what to do when we are closed.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <div className="gp-columns">
          <section className="gp-card" aria-labelledby="contact-details-heading">
            <h2 id="contact-details-heading">Contact details</h2>
            <dl className="gp-contact-list gp-contact-list--large">
              <div>
                <dt>Address</dt>
                <dd>
                  <address className="gp-address">
                    {SURGERY.name}
                    {SURGERY.addressLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </address>
                </dd>
              </div>
              <div>
                <dt>Telephone</dt>
                <dd>{SURGERY.phone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd className="gp-email">{SURGERY.email}</dd>
              </div>
              <div>
                <dt>Online</dt>
                <dd>
                  <Link href={`${GP_BASE}/online-consultation/`}>Use our online consultation form</Link>
                </dd>
              </div>
            </dl>
          </section>

          <section className="gp-card" aria-labelledby="opening-hours-heading">
            <h2 id="opening-hours-heading">Opening hours</h2>
            <OpeningHoursTable caption="The surgery and phone lines are open at these times." />
            <p className="gp-card__foot">
              <strong>Extended hours:</strong> {EXTENDED_HOURS}
            </p>
          </section>
        </div>

        <article className="gp-prose">
          <h2>Emailing the surgery</h2>
          <p>
            You can email reception at <strong>{SURGERY.email}</strong> about non-urgent admin, for example to change or cancel
            an appointment, update your address or phone number, or ask a general question.
          </p>
          <p>
            Please include your <strong>full name</strong> and <strong>date of birth</strong> in every email so that we can find
            your records. We aim to reply within 2 working days.
          </p>
          <p>
            Please do not email us about medical problems. Use our{" "}
            <Link href={`${GP_BASE}/online-consultation/`}>online consultation form</Link> instead, so that a clinician can review
            your request.
          </p>

          <h2>When the surgery is closed</h2>
          <p>
            When we are closed, including evenings, weekends and bank holidays, please call <strong>111</strong> for urgent
            medical help. Your local pharmacy can also give advice on many minor illnesses.
          </p>

          <h2>Getting here</h2>
          <p>
            We are on Riverside Road, opposite Millbrook Library. The number 12 and 34 buses stop outside the surgery. There is a
            small car park with 4 disabled parking spaces, and a cycle rack by the main entrance.
          </p>
          <p>
            The building has step-free access, an accessible toilet and a hearing loop at reception.
          </p>
        </article>

        <UrgentHelp compact />
      </div>
    </>
  );
}
