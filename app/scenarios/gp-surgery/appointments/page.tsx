import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faHospital,
  faHouse,
  faLanguage,
  faLaptop,
  faPersonWalking,
  faPhone,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import GpPageHeader from "../components/GpPageHeader";
import OpeningHoursTable from "../components/OpeningHoursTable";
import { EmailAddress, GpCallout, GpCard, GpCards, GpSection, GpSteps } from "../components/GpBlocks";
import { EXTENDED_HOURS, GP_BASE, SURGERY } from "../surgery-data";

export const metadata: Metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <>
      <GpPageHeader title="Appointments">
        <p>How to get, change or cancel an appointment.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <GpSection title="How to ask for an appointment">
          <GpCards>
            <GpCard icon={faLaptop} title="Online">
              <p>Fastest. Any time of day.</p>
              <Link href={`${GP_BASE}/online-consultation/`} className="gp-btn gp-btn--primary gp-btn--small">
                Use the online form <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
              </Link>
            </GpCard>
            <GpCard icon={faPhone} title="Phone">
              <p className="gp-info-card__value">{SURGERY.phone}</p>
              <p>Monday to Friday, from 8:00am.</p>
            </GpCard>
            <GpCard icon={faPersonWalking} title="In person">
              <p>Come to reception when we are open.</p>
            </GpCard>
          </GpCards>
        </GpSection>

        <GpSection title="What happens next">
          <GpSteps
            steps={[
              { title: "You tell us what you need" },
              { title: "We read your request", text: "A doctor or nurse decides who can help." },
              { title: "We contact you", text: "By the end of the next working day." },
            ]}
          />
        </GpSection>

        <GpSection title="Types of appointment">
          <GpCards>
            <GpCard icon={faHospital} title="At the surgery">
              <p>See a doctor or nurse here.</p>
            </GpCard>
            <GpCard icon={faPhone} title="Phone call">
              <p>A doctor or nurse calls you.</p>
            </GpCard>
            <GpCard icon={faVideo} title="Video call">
              <p>We text you a link.</p>
            </GpCard>
            <GpCard icon={faHouse} title="Home visit">
              <p>Only if you cannot leave home. Call before 10:30am.</p>
            </GpCard>
          </GpCards>
        </GpSection>

        <GpSection title="Evening and Saturday appointments">
          <OpeningHoursTable caption="You must book these in advance." rows={EXTENDED_HOURS} />
        </GpSection>

        <section className="gp-block" id="change-or-cancel">
          <h2 className="gp-block__title">Cannot come to your appointment?</h2>
          <GpCallout>Please tell us as soon as you can. Then someone else can have the appointment.</GpCallout>
          <GpCards>
            <GpCard icon={faPhone} title="Call us">
              <p className="gp-info-card__value">{SURGERY.phone}</p>
            </GpCard>
            <GpCard icon={faEnvelope} title="Email us">
              <p className="gp-info-card__value">
                <EmailAddress email={SURGERY.email} />
              </p>
              <p>In your email, write:</p>
              <ul className="gp-tick-list">
                <li>your name</li>
                <li>your date of birth</li>
                <li>the day and time of your appointment</li>
              </ul>
            </GpCard>
          </GpCards>
        </section>

        <GpSection title="Need an interpreter?">
          <GpCards>
            <GpCard icon={faLanguage} title="We can book one for you">
              <p>Tell us when you contact us. We also offer British Sign Language.</p>
            </GpCard>
          </GpCards>
        </GpSection>
      </div>
    </>
  );
}
