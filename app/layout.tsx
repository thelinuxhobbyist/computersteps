import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const displayFont = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Computer Steps | Learn digital skills one step at a time",
  description:
    "Free, calm interactive lessons for building computer confidence — clicking, typing, browsing, files and email.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
