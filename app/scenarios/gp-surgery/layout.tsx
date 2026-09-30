import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import GpHeader from "./components/GpHeader";
import GpFooter from "./components/GpFooter";
import { SURGERY } from "./surgery-data";
import "./gp.css";

export const metadata: Metadata = {
  title: {
    default: `${SURGERY.name} | Practice GP website`,
    template: `%s | ${SURGERY.name}`,
  },
  description: "A pretend GP surgery website for practising finding information and contacting a surgery online.",
};

export default function GpSurgeryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="gp-site">
      <div className="gp-practice-strip" role="note">
        <div className="gp-wrap gp-practice-strip__inner">
          <p>
            <strong>Practice website.</strong> This surgery is not real. Never enter your real personal or medical information.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <GpHeader />
      <main className="gp-main" id="gp-main">
        {children}
      </main>
      <GpFooter />
    </div>
  );
}
