export const PRACTICE_USER_EMAIL = "you@example.org";

export const SENDER_EMAILS: Record<string, string> = {
  Tutor: "tutor@example.org",
  Library: "library@example.org",
  Support: "support@example.org",
  Friend: "friend@example.org",
  Doctor: "doctor@example.org",
};

export const INBOX_SUBJECTS: Record<string, string> = {
  Tutor: "Your lesson notes",
  Library: "Your book is ready",
  Support: "We can help",
  Friend: "Hello!",
  Doctor: "Appointment reminder",
};

export function senderAddress(name: string): string {
  return SENDER_EMAILS[name] ?? `${name.toLowerCase()}@example.org`;
}

export function inboxMessagesFromSenders(senders: string[], highlight?: string) {
  return senders.map((from) => ({
    from,
    subject: INBOX_SUBJECTS[from] ?? "Message for you",
    selected: from === highlight,
  }));
}
