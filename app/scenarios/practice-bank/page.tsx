import type { Metadata } from "next";
import LogIn from "./LogIn";

export const metadata: Metadata = {
  title: "Log in",
};

export default function PracticeBankHomePage() {
  return <LogIn />;
}
