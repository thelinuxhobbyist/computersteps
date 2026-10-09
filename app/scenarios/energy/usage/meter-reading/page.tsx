import type { Metadata } from "next";
import MeterReading from "./MeterReading";

export const metadata: Metadata = { title: "Send a meter reading" };

export default function MeterReadingPage() {
  return <MeterReading />;
}
