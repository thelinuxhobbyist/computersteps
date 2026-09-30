import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faFileLines, faMobileScreen, faPrescriptionBottleMedical } from "@fortawesome/free-solid-svg-icons";
import GpPageHeader from "../components/GpPageHeader";
import { GpCallout, GpCard, GpCards, GpSection, GpSteps } from "../components/GpBlocks";
import { GP_BASE } from "../surgery-data";

export const metadata: Metadata = { title: "Prescriptions" };

export default function PrescriptionsPage() {
  return (
    <>
      <GpPageHeader title="Prescriptions">
        <p>How to order more of the medicine you take regularly.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <GpCallout tone="warning">
          <strong>Order 3 working days before you run out.</strong>
        </GpCallout>

        <GpSection title="How to order">
          <GpCards>
            <GpCard icon={faMobileScreen} title="NHS App">
              <p>Order on your phone.</p>
            </GpCard>
            <GpCard icon={faFileLines} title="Paper form">
              <p>Tick your medicines on your last prescription. Put it in the box at reception.</p>
            </GpCard>
            <GpCard icon={faPrescriptionBottleMedical} title="Your pharmacy">
              <p>Ask your pharmacy to order it for you.</p>
            </GpCard>
          </GpCards>
          <p className="gp-block__note">We cannot take orders by phone.</p>
        </GpSection>

        <GpSection title="Getting your medicine">
          <GpSteps
            steps={[
              { title: "You order your medicine" },
              { title: "We send it to your pharmacy" },
              { title: "You collect it from the pharmacy" },
            ]}
          />
        </GpSection>

        <GpSection title="A question about your medicine?">
          <Link href={`${GP_BASE}/online-consultation/`} className="gp-btn gp-btn--primary">
            Use the online form <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        </GpSection>
      </div>
    </>
  );
}
