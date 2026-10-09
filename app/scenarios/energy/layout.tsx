import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import EnergyHeader from "./components/EnergyHeader";
import EnergyFooter from "./components/EnergyFooter";
import { WESTFORD } from "./energy-data";
import "./energy.css";

export const metadata: Metadata = {
  title: {
    default: `${WESTFORD.name} | Practice energy website`,
    template: `%s | ${WESTFORD.name}`,
  },
  description: "A pretend energy company for practising reading bills, paying online and finding help.",
};

export default function EnergyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="we-site">
      <div className="we-practice-strip" role="note">
        <div className="we-wrap we-practice-strip__inner">
          <p>
            <strong>Practice website.</strong> Westford Energy is not a real company and uses pretend money. Never enter your real
            details.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <EnergyHeader />
      <main className="we-main" id="we-main">
        {children}
      </main>
      <EnergyFooter />
    </div>
  );
}
