import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import BankHeader from "./components/BankHeader";
import { BANK_NAME } from "./bank-data";
import "./bank.css";

export const metadata: Metadata = {
  title: {
    default: `${BANK_NAME} | Practice banking website`,
    template: `%s | ${BANK_NAME}`,
  },
  description: "A pretend bank for practising online banking: check your balance, find a payment and download a statement.",
};

export default function PracticeBankLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-site">
      <div className="pb-practice-strip" role="note">
        <div className="pb-wrap pb-practice-strip__inner">
          <p>
            <strong>Practice website.</strong> This bank is not real and uses pretend money. Never enter your real bank details.
          </p>
          <Link href="/scenarios/">← Back to Computer Steps</Link>
        </div>
      </div>
      <BankHeader />
      <main className="pb-main" id="pb-main">
        {children}
      </main>
      <footer className="pb-footer">
        <div className="pb-wrap pb-footer__inner">
          <p>
            <strong>{BANK_NAME}</strong> is part of Computer Steps. It is for practice only: no real accounts, cards or money.
          </p>
          <p>Accounts that are not opened for 12 months are closed automatically.</p>
        </div>
      </footer>
    </div>
  );
}
