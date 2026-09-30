import type { Metadata } from "next";
import GpPageHeader from "../components/GpPageHeader";
import { SURGERY } from "../surgery-data";

export const metadata: Metadata = { title: "New patients" };

export default function NewPatientsPage() {
  return (
    <>
      <GpPageHeader title="New patients">
        <p>How to register with {SURGERY.name}.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <article className="gp-prose">
          <h2>Who can register</h2>
          <p>
            You can register with us if you live in our practice area, which covers Millbrook, Riverside, Ashford Green and Lower
            Barton. You do not need proof of address or immigration status, an ID or an NHS number to register.
          </p>

          <h2>How to register</h2>
          <ol>
            <li>Collect a registration form from reception, or ask us to post one to you.</li>
            <li>Fill in the form. If you are registering children, fill in a separate form for each child.</li>
            <li>Return the form to reception.</li>
          </ol>
          <p>
            We will write to you within 2 weeks to confirm your registration. We may invite you to a new patient health check with
            our healthcare assistant.
          </p>

          <h2>Changing your details</h2>
          <p>
            If you move house or change your phone number, please tell us straight away so that we can contact you. You can let
            reception know in person, by phone on {SURGERY.phone}, or by email at {SURGERY.email}.
          </p>
        </article>
      </div>
    </>
  );
}
