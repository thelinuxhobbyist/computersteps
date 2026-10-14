import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ScenarioGate } from "../../components/ScenarioSignIn";
import "../practice-shell.css";
import MobileNav from "./MobileNav";

export const metadata: Metadata = {
  title: { default: "Westford Mobile | Practice mobile provider", template: "%s | Westford Mobile" },
  description: "A pretend mobile phone provider for practising bills, usage and support requests.",
};

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ps ps--mobile">
      <div className="ps-note" role="note">
        <div className="ps-wrap">
          <p>
            <strong>Practice website.</strong> Westford Mobile is not a real network. Bills use pretend money.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <MobileNav />
      <main className="ps-main" id="mobile-main">
        <ScenarioGate>{children}</ScenarioGate>
      </main>
      <footer className="ps-footer">
        <div className="ps-wrap">
          <p>Westford Mobile is a fictional practice website. Accounts that are not used for 12 months are closed with the Computer Steps account they belong to.</p>
        </div>
      </footer>
    </div>
  );
}
