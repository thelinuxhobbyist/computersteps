import type { Metadata } from "next";
import Link from "next/link";
import GpPageHeader from "../components/GpPageHeader";
import { GP_BASE } from "../surgery-data";

export const metadata: Metadata = { title: "Prescriptions" };

export default function PrescriptionsPage() {
  return (
    <>
      <GpPageHeader title="Prescriptions">
        <p>How to order repeat prescriptions and collect your medicine.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <article className="gp-prose">
          <h2>Ordering a repeat prescription</h2>
          <p>
            A repeat prescription is medicine you take regularly that your GP has agreed you can order without an appointment.
            Please allow <strong>3 working days</strong> for your prescription to be ready. Do not wait until you have run out.
          </p>
          <p>You can order a repeat prescription:</p>
          <ul>
            <li>
              <strong>Using the NHS App</strong> or another online service linked to the surgery.
            </li>
            <li>
              <strong>In person:</strong> tick the medicines you need on the right-hand side of your last prescription and put it
              in the box at reception.
            </li>
            <li>
              <strong>Through your pharmacy:</strong> many pharmacies can order your repeat medicine for you.
            </li>
          </ul>
          <p>We do not accept repeat prescription requests over the phone, to help avoid mistakes.</p>

          <h2>Collecting your medicine</h2>
          <p>
            Your prescription is sent electronically to the pharmacy you have chosen, called your nominated pharmacy. You can
            collect your medicine from there. To change your nominated pharmacy, ask any pharmacy or speak to our reception team.
          </p>

          <h2>Medication reviews</h2>
          <p>
            If you take regular medicine, we will invite you for a medication review at least once a year to make sure your
            medicine is still right for you.
          </p>

          <h2>Questions about your medicine</h2>
          <p>
            If you have a question about your medicine, or think it is not working for you, please use our{" "}
            <Link href={`${GP_BASE}/online-consultation/`}>online consultation form</Link> and choose &ldquo;A question about
            medication&rdquo;.
          </p>
        </article>
      </div>
    </>
  );
}
