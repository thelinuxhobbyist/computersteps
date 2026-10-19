import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./mail.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Westford Mail", template: "%s | Westford Mail" },
  description: "A pretend email service for Computer Steps. Messages stay inside the practice websites.",
};

export default function MailLayout({ children }: { children: ReactNode }) {
  return <div className={`${atkinson.className} wm-app`}>{children}</div>;
}
