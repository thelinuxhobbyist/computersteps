import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "../practice-shell.css";
import TravelNav from "./TravelNav";

export const metadata: Metadata = {
  title: { default: "Westford Travel | Practice trip booking", template: "%s | Westford Travel" },
  description: "A pretend travel website for practising flight, hotel and holiday rental searches.",
};

export default function TravelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ps ps--travel">
      <div className="ps-note" role="note">
        <div className="ps-wrap">
          <p>
            <strong>Practice website.</strong> Westford Travel does not sell real trips. Payments use pretend money.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <TravelNav />
      <main className="ps-main">{children}</main>
      <footer className="ps-footer">
        <div className="ps-wrap">
          <p>Westford Travel is fictional. Confirmed bookings are saved on your Computer Steps account. No airline, hotel or card company is contacted.</p>
        </div>
      </footer>
    </div>
  );
}
