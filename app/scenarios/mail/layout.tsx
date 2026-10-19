import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./mail.css";

export const metadata: Metadata = {
  title: { default: "Westford Mail", template: "%s | Westford Mail" },
  description: "A pretend email service for Computer Steps. Messages stay inside the practice websites.",
};

export default function MailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wm-site">
      <div className="wm-strip" role="note">
        <div className="wm-wrap wm-strip__inner">
          <p>
            <strong>Practice email.</strong> Westford Mail does not send anything to a real address.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <header className="wm-header">
        <div className="wm-wrap">
          <Link href="/scenarios/mail/" className="wm-brand">
            <span aria-hidden="true">WM</span> Westford Mail
          </Link>
        </div>
      </header>
      <main id="wm-main">{children}</main>
    </div>
  );
}
