import type { Metadata } from "next";
import Link from "next/link";
import GpPageHeader from "../components/GpPageHeader";
import { EXTENDED_HOURS, GP_BASE, SURGERY } from "../surgery-data";

export const metadata: Metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <>
      <GpPageHeader title="Appointments">
        <p>How to ask for an appointment, the types of appointment we offer, and how to change or cancel one.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <article className="gp-prose">
          <h2>How to ask for an appointment</h2>
          <p>
            To help us see everyone fairly, we ask all patients to tell us what they need help with first. A member of our
            clinical team will read your request and decide who is the best person to help you. This might be a GP, a nurse, a
            pharmacist or another member of our team.
          </p>
          <ul>
            <li>
              <strong>Online:</strong> fill in our <Link href={`${GP_BASE}/online-consultation/`}>online consultation form</Link>.
              This is the quickest way to reach us, and you can use it at any time.
            </li>
            <li>
              <strong>By phone:</strong> call us on {SURGERY.phone} from 8:00am, Monday to Friday. Our phone lines are busiest
              first thing in the morning.
            </li>
            <li>
              <strong>In person:</strong> visit reception during opening hours and a member of the team will help you.
            </li>
          </ul>
          <p>We will contact you by the end of the next working day to let you know what happens next.</p>

          <h2>Types of appointment</h2>
          <ul>
            <li>
              <strong>Face-to-face appointments</strong> at the surgery with a GP, nurse or healthcare assistant.
            </li>
            <li>
              <strong>Telephone appointments</strong> where a clinician calls you at a time agreed with you.
            </li>
            <li>
              <strong>Video appointments</strong> using a secure link sent to your mobile phone by text message.
            </li>
            <li>
              <strong>Home visits</strong> for patients who are housebound. Please call before 10:30am to ask for a home visit.
            </li>
          </ul>

          <h2>Evening and weekend appointments</h2>
          <p>{EXTENDED_HOURS} These must be booked in advance.</p>

          <h2 id="change-or-cancel">Changing or cancelling an appointment</h2>
          <p>
            If you cannot attend your appointment, please let us know as soon as possible so that we can offer it to another
            patient. You can:
          </p>
          <ul>
            <li>
              call reception on <strong>{SURGERY.phone}</strong>, or
            </li>
            <li>
              email us at <strong>{SURGERY.email}</strong>. Please include your full name, date of birth, and the date and time of
              your appointment.
            </li>
          </ul>
          <p>
            Last month, 142 appointments were missed without patients letting us know. That is over 23 hours of appointment time
            that could have been used by other patients.
          </p>

          <h2>Chaperones and interpreters</h2>
          <p>
            You can ask for a chaperone to be present at any appointment. If you need an interpreter or British Sign Language
            support, please let us know when you contact us and we will arrange this for you.
          </p>
        </article>
      </div>
    </>
  );
}
