import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./council.css";

export const metadata: Metadata = {
  title: {
    default: "Westford Council | Practice council website",
    template: "%s | Westford Council",
  },
  description: "A pretend local council website for practising everyday online tasks such as bill checking, bin collections and service requests.",
};

function CouncilHeader() {
  return (
    <header className="council-header">
      <div className="council-wrap council-header__inner">
        <Link href="/scenarios/council/" className="council-brand" aria-label="Westford Council home">
          <span className="council-brand__mark" aria-hidden="true">WC</span>
          <span>Westford Council</span>
        </Link>

        <nav className="council-nav" aria-label="Westford Council navigation">
          <Link href="/scenarios/council/">Home</Link>
          <Link href="/scenarios/council/account/">My Account</Link>
          <Link href="/scenarios/council/council-tax/">Council Tax</Link>
          <Link href="/scenarios/council/bins/">Bins &amp; Recycling</Link>
          <Link href="/scenarios/council/report/">Report a Problem</Link>
          <Link href="/scenarios/council/contact/">Contact Us</Link>
        </nav>
      </div>
    </header>
  );
}

export default function CouncilLayout({ children }: { children: ReactNode }) {
  return (
    <div className="council-site">
      <div className="council-practice-strip" role="note">
        <div className="council-wrap council-practice-strip__inner">
          <p>
            <strong>Practice website.</strong> Westford Council is a fictional council service for learning safe online tasks. Nothing here is real.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <CouncilHeader />
      <main className="council-main" id="council-main">
        {children}
      </main>
      <footer className="council-footer">
        <div className="council-wrap council-footer__inner">
          <p>© {new Date().getFullYear()} Westford Council. Fictional practice website.</p>
        </div>
      </footer>
    </div>
  );
}
