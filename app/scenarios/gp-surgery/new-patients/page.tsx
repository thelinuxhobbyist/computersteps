import type { Metadata } from "next";
import { faEnvelope, faPhone, faPersonWalking } from "@fortawesome/free-solid-svg-icons";
import GpPageHeader from "../components/GpPageHeader";
import { EmailAddress, GpCallout, GpCard, GpCards, GpDoDont, GpSection, GpSteps } from "../components/GpBlocks";
import { SURGERY } from "../surgery-data";

export const metadata: Metadata = { title: "New patients" };

export default function NewPatientsPage() {
  return (
    <>
      <GpPageHeader title="New patients">
        <p>How to join {SURGERY.name}.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        <GpSection title="Can I join?">
          <GpDoDont
            yesTitle="You can join if you live in"
            yes={["Millbrook", "Ashford Green", "Lower Barton"]}
            noTitle="You do not need"
            no={["ID", "Proof of address", "An NHS number"]}
          />
        </GpSection>

        <GpSection title="How to join">
          <GpSteps
            steps={[
              { title: "Get a form", text: "Ask at reception." },
              { title: "Fill in the form", text: "One form for each person." },
              { title: "Give the form back", text: "Bring it to reception." },
              { title: "Wait for a letter", text: "We write to you within 2 weeks." },
            ]}
          />
        </GpSection>

        <GpSection title="New address or phone number?">
          <GpCallout>Please tell us straight away.</GpCallout>
          <GpCards>
            <GpCard icon={faPersonWalking} title="Visit us">
              <p>Come to reception.</p>
            </GpCard>
            <GpCard icon={faPhone} title="Call us">
              <p className="gp-info-card__value">{SURGERY.phone}</p>
            </GpCard>
            <GpCard icon={faEnvelope} title="Email us">
              <p className="gp-info-card__value">
                <EmailAddress email={SURGERY.email} />
              </p>
            </GpCard>
          </GpCards>
        </GpSection>
      </div>
    </>
  );
}
