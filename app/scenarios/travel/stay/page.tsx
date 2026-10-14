import type { Metadata } from "next";
import { StayDetail } from "../TravelViews";

export const metadata: Metadata = { title: "Trip details" };

export default function StayDetailPage() {
  return <StayDetail />;
}
