import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ScenarioGate } from "../../components/ScenarioSignIn";
import "../practice-shell.css";
import DeliveryNav from "./DeliveryNav";

export const metadata: Metadata = {
  title: { default: "Westford Deliveries | Practice parcel tracking", template: "%s | Westford Deliveries" },
  description: "A pretend parcel website for practising tracking codes and delivery instructions.",
};

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ps ps--deliveries">
      <div className="ps-note" role="note">
        <div className="ps-wrap">
          <p>
            <strong>Practice website.</strong> Westford Deliveries is not a real courier. No parcel is moved.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <DeliveryNav />
      <main className="ps-main">
        <ScenarioGate>{children}</ScenarioGate>
      </main>
      <footer className="ps-footer">
        <div className="ps-wrap">
          <p>Westford Deliveries is fictional. Saved delivery changes stay on your Computer Steps account for up to 12 months.</p>
        </div>
      </footer>
    </div>
  );
}
