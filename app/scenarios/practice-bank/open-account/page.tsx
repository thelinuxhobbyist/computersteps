import type { Metadata } from "next";
import OpenAccount from "./OpenAccount";

export const metadata: Metadata = {
  title: "Open an account",
};

export default function OpenAccountPage() {
  return <OpenAccount />;
}
