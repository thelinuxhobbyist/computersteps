import type { Metadata } from "next";
import GpPageHeader from "../components/GpPageHeader";
import ConsultationForm from "./ConsultationForm";

export const metadata: Metadata = { title: "Contact us online" };

export default function OnlineConsultationPage() {
  return (
    <>
      <GpPageHeader title="Contact us online">
        <p>Tell us what you need help with, and our practice team will decide how best to help you.</p>
      </GpPageHeader>
      <ConsultationForm />
    </>
  );
}
