import type { Random } from "./bank";
import type { FormErrors } from "./energy";
import type { MessageStatus } from "./shared/messaging-types";

export type TopicOption = { id: string; label: string };

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** WE-2026-10482. The number is random so two learners never share a hard-coded reference. */
export function makeEnquiryReference(prefix: string, now: Date, random: Random): string {
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/London" }).format(now);
  const serial = 10000 + Math.floor(random() * 90000);
  return `${prefix}-${year}-${serial}`;
}

export function checkContactMessage(
  body: Record<string, unknown>,
  topics: readonly TopicOption[],
): { topic: string; message: string } | { errors: FormErrors } {
  const topic = topics.find((item) => item.id === body.topic)?.id;
  const message = text(body.message, 1000);
  const errors: FormErrors = {};
  if (!topic) errors.topic = "Choose what your message is about.";
  if (message.length < 10) errors.message = "Write a short message telling us how we can help (at least 10 letters).";
  if (!topic || Object.keys(errors).length > 0) return { errors };
  return { topic, message };
}

export function messageStatusLabel(status: MessageStatus): string {
  return status === "replied" ? "Reply received" : "Received";
}

/** A short fictional reply so the learner can see the request move on, without any real email. */
export function simulatedReply(organisation: string, fullName: string, topicLabel: string): string {
  return `Dear ${fullName},\n\nThank you for your message about “${topicLabel}”. ${organisation} has logged this on your practice account. A member of the team will look at it within two working days.\n\nYou do not need to send a real email. This reply is only shown on this practice website.\n\nKind regards\n${organisation} customer services`;
}
