import type { Metadata } from "next";
import MailboxApp from "./MailboxApp";

export const metadata: Metadata = { title: "Inbox" };

export default function MailPage() {
  return <MailboxApp />;
}
