import type { Metadata } from "next";
import TutorMode from "./TutorMode";
import "./tutor.css";

export const metadata: Metadata = {
  title: "Tutor Mode | Computer Steps",
  robots: { index: false, follow: false },
};

export default function TutorPage() {
  return <TutorMode />;
}
