import type { Metadata } from "next";
import { FlightDetail } from "../TravelViews";

export const metadata: Metadata = { title: "Flight details" };

export default function FlightDetailPage() {
  return <FlightDetail />;
}
