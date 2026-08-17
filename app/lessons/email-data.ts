export const PRACTICE_USER_NAME = "You";
export const PRACTICE_USER_EMAIL = "you@example.org";

export type EmailContact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  preview: string;
};

export const EMAIL_CONTACTS: Record<string, EmailContact> = {
  tutor: {
    id: "tutor",
    name: "Learning Centre",
    email: "tutor@example.org",
    subject: "Your lesson notes",
    preview: "Hello,\n\nHere are your lesson notes from this week.",
  },
  library: {
    id: "library",
    name: "City Library",
    email: "library@example.org",
    subject: "Your book is ready",
    preview: "Hello,\n\nYour book is ready to collect.",
  },
  support: {
    id: "support",
    name: "Help Desk",
    email: "support@example.org",
    subject: "We can help",
    preview: "Hello,\n\nTell us what you need help with.",
  },
  james: {
    id: "james",
    name: "James",
    email: "friend@example.org",
    subject: "Hello!",
    preview: "Hi,\n\nHow are you doing?",
  },
  doctor: {
    id: "doctor",
    name: "Dr Patel",
    email: "doctor@example.org",
    subject: "Appointment reminder",
    preview: "Hello,\n\nThis is a reminder about your appointment.",
  },
  eno: {
    id: "eno",
    name: "Eno Electricity",
    email: "billing@eno.example",
    subject: "Your bill is ready",
    preview: "Hello,\n\nYour electricity bill is ready to view.",
  },
  bank: {
    id: "bank",
    name: "Metro Bank",
    email: "alerts@metrobank.example",
    subject: "Payment due",
    preview: "Hello,\n\nThis is a reminder that a payment is due on your account.",
  },
  mum: {
    id: "mum",
    name: "Mum",
    email: "mum@example.org",
    subject: "Sunday lunch?",
    preview: "Hi love,\n\nAre you coming for Sunday lunch?",
  },
  council: {
    id: "council",
    name: "City Council",
    email: "council-tax@city.example",
    subject: "Council tax reminder",
    preview: "Hello,\n\nThis is a reminder about your council tax payment.",
  },
};

/** Legacy lesson ids (Tutor, Library, …) map to contact keys. */
const LEGACY_CONTACT_MAP: Record<string, string> = {
  Tutor: "tutor",
  Library: "library",
  Support: "support",
  Friend: "james",
  Doctor: "doctor",
};

export function resolveContactId(idOrName: string): string {
  return LEGACY_CONTACT_MAP[idOrName] ?? idOrName.toLowerCase();
}

export function getContact(idOrName: string): EmailContact {
  const id = resolveContactId(idOrName);
  const contact = EMAIL_CONTACTS[id];
  if (contact) return contact;

  return {
    id,
    name: idOrName,
    email: `${id}@example.org`,
    subject: "Message for you",
    preview: "Hello,\n\nThank you for using Computer Steps.",
  };
}

export function inboxFromContactIds(contactIds: string[], highlightId?: string) {
  const highlight = highlightId ? resolveContactId(highlightId) : undefined;

  return contactIds.map((contactId) => {
    const contact = getContact(contactId);
    return {
      id: contact.id,
      name: contact.name,
      subject: contact.subject,
      selected: contact.id === highlight,
    };
  });
}

export const DEFAULT_INBOX_IDS = ["tutor", "library", "support", "james", "doctor", "eno"];

export const ADVANCED_INBOX_IDS = ["tutor", "library", "support", "james", "doctor", "eno", "bank", "mum", "council"];

export function senderAddress(name: string): string {
  return getContact(name).email;
}

export const INBOX_SUBJECTS: Record<string, string> = Object.fromEntries(
  Object.values(EMAIL_CONTACTS).map((contact) => [contact.name, contact.subject]),
);

/** @deprecated use inboxFromContactIds */
export function inboxMessagesFromSenders(senders: string[], highlight?: string) {
  return inboxFromContactIds(senders.map(resolveContactId), highlight).map((message) => ({
    from: message.name,
    subject: message.subject,
    selected: message.selected,
  }));
}
