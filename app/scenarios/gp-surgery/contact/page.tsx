import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBus,
  faCar,
  faEarListen,
  faEnvelope,
  faLaptop,
  faLocationDot,
  faPhone,
  faWheelchair,
} from "@fortawesome/free-solid-svg-icons";
import GpPageHeader from "../components/GpPageHeader";
import OpeningHoursTable from "../components/OpeningHoursTable";
import UrgentHelp from "../components/UrgentHelp";
import { EmailAddress, GpCard, GpCards, GpDoDont, GpSection } from "../components/GpBlocks";
import { GP_BASE, SURGERY } from "../surgery-data";

export const metadata: Metadata = { title: "Contact and opening hours" };

export default function ContactPage() {
  return (
    <>
      <GpPageHeader title="Contact and opening hours">
        <p>How to contact us, and when we are open.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <GpSection title="Contact us">
          <GpCards>
            <GpCard icon={faPhone} title="Phone">
              <p className="gp-info-card__value">{SURGERY.phone}</p>
            </GpCard>
            <GpCard icon={faEnvelope} title="Email">
              <p className="gp-info-card__value">
                <EmailAddress email={SURGERY.email} />
              </p>
            </GpCard>
            <GpCard icon={faLocationDot} title="Address">
              <address className="gp-address">
                {SURGERY.name}
                {SURGERY.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </GpCard>
            <GpCard icon={faLaptop} title="Online">
              <Link href={`${GP_BASE}/online-consultation/`} className="gp-btn gp-btn--primary gp-btn--small">
                Use the online form <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
              </Link>
            </GpCard>
          </GpCards>
        </GpSection>

        <GpSection title="Opening hours">
          <div className="gp-hours-card">
            <OpeningHoursTable caption="The surgery and phone lines are open at these times." />
          </div>
        </GpSection>

        <UrgentHelp compact />

        <GpSection title="Emailing us">
          <p className="gp-block__lead">
            Our email is <strong>{SURGERY.email}</strong>. Always write your <strong>name</strong> and{" "}
            <strong>date of birth</strong>. We reply within 2 working days.
          </p>
          <GpDoDont
            yesTitle="Email us to"
            yes={["Change or cancel an appointment", "Tell us your new address or phone number", "Ask a general question"]}
            noTitle="Do not email us about"
            no={[
              <>
                Health problems. Use the <Link href={`${GP_BASE}/online-consultation/`}>online form</Link>.
              </>,
              "Anything urgent",
            ]}
          />
        </GpSection>

        <GpSection title="Getting here">
          <ul className="gp-icon-list">
            <li>
              <FontAwesomeIcon icon={faBus} aria-hidden="true" /> Bus 12 and 34 stop outside.
            </li>
            <li>
              <FontAwesomeIcon icon={faCar} aria-hidden="true" /> Small car park, with 4 disabled spaces.
            </li>
            <li>
              <FontAwesomeIcon icon={faWheelchair} aria-hidden="true" /> No steps. Accessible toilet.
            </li>
            <li>
              <FontAwesomeIcon icon={faEarListen} aria-hidden="true" /> Hearing loop at reception.
            </li>
          </ul>
        </GpSection>
      </div>
    </>
  );
}
