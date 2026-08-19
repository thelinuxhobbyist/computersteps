import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./fontawesome";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Computer Steps | Learn digital skills one step at a time",
  description:
    "Free, calm interactive lessons for building computer confidence — clicking, typing, browsing, files and email.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className={`${roboto.className} min-h-full`}>{children}</body>
    </html>
  );
}
