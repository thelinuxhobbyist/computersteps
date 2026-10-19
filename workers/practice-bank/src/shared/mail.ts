/** Shared mailbox for every Computer Steps scenario. Nothing here leaves the practice site. */

export const MAIL_RETENTION_DAYS = 14;
export const MAIL_MESSAGE_CAP = 80;
/** A follow-up such as an interview invitation appears after this delay, on the next visit to Westford Mail. */
export const FOLLOW_UP_DELAY_MS = 3 * 60 * 1000;

export const MAIL_ORGS = [
  { id: "bank", name: "Westford Bank", address: "help@westfordbank.practice", scenario: "bank" },
  { id: "foods", name: "Westford Foods", address: "orders@westfordfoods.practice", scenario: "shop" },
  { id: "energy", name: "Westford Energy", address: "help@westfordenergy.practice", scenario: "energy" },
  { id: "council", name: "Westford Council", address: "contact@westfordcouncil.practice", scenario: "council" },
  { id: "jobs", name: "Westford Jobs", address: "help@westfordjobs.practice", scenario: "jobs" },
  { id: "deliveries", name: "Westford Deliveries", address: "help@westforddeliveries.practice", scenario: "deliveries" },
  { id: "mobile", name: "Westford Mobile", address: "help@westfordmobile.practice", scenario: "mobile" },
  { id: "travel", name: "Westford Travel", address: "help@westfordtravel.practice", scenario: "travel" },
  { id: "gp", name: "Yama Clinic", address: "reception@yamaclinic.practice", scenario: "gp" },
  { id: "mail", name: "Westford Mail", address: "hello@westfordmail.practice", scenario: "mail" },
] as const;

export type MailOrgId = (typeof MAIL_ORGS)[number]["id"];

export type MailAttachment = { name: string };

export type MailDraft = {
  mailbox: "inbox" | "sent";
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  subject: string;
  body: string;
  sentAt: string;
  visibleAt: string;
  conversationId: string;
  scenario: string;
  eventKey: string;
  eventRef: string | null;
  attachments: MailAttachment[];
};

export type MailHolder = { username: string; fullName: string };

export type ReplyContext = {
  balancePence: number | null;
  transactions: { description: string; amountPence: number; postedAt: string; reference: string | null }[];
  application: { reference: string; title: string; employer: string; status: string } | null;
  councilReference: string | null;
  energyAccount: string | null;
  prescriptionReference: string | null;
  mobileNumber: string | null;
};

const FILE_NAME = /^[\w .\-()]{1,80}$/;
const SAFE_EXTENSIONS = [".pdf", ".txt", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

export function learnerAddress(username: string): string {
  return `${username.toLowerCase()}@westfordmail.practice`;
}

export function findOrg(address: string) {
  const normal = address.trim().toLowerCase();
  return MAIL_ORGS.find((org) => org.address === normal);
}

export function pounds(pence: number): string {
  const amount = (Math.abs(pence) / 100).toFixed(2);
  return `${pence < 0 ? "-" : ""}£${amount}`;
}

export function mailDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(new Date(iso));
}

export function retentionCutoff(now: Date): string {
  return new Date(now.getTime() - MAIL_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function org(id: MailOrgId) {
  const found = MAIL_ORGS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown mail organisation ${id}`);
  return found;
}

function letter(input: {
  holder: MailHolder;
  from: MailOrgId;
  subject: string;
  body: string;
  at: string;
  visibleAt?: string;
  scenario: string;
  eventKey: string;
  eventRef?: string | null;
  attachments?: MailAttachment[];
}): MailDraft {
  const sender = org(input.from);
  return {
    mailbox: "inbox",
    fromName: sender.name,
    fromAddress: sender.address,
    toName: input.holder.fullName,
    toAddress: learnerAddress(input.holder.username),
    subject: input.subject,
    body: input.body.trim(),
    sentAt: input.visibleAt ?? input.at,
    visibleAt: input.visibleAt ?? input.at,
    conversationId: input.eventKey.slice(0, 120),
    scenario: input.scenario,
    eventKey: input.eventKey,
    eventRef: input.eventRef ?? null,
    attachments: input.attachments ?? [],
  };
}

export function openedAccountMail(holder: MailHolder, details: { sortCode: string; accountNumber: string; openedAt: string }): MailDraft[] {
  const at = details.openedAt;
  return [
    letter({
      holder,
      from: "mail",
      subject: "Welcome to Westford Mail",
      body: `Dear ${holder.fullName},

Your Computer Steps username is ${holder.username}. This inbox is ${learnerAddress(holder.username)}.

Messages from Westford Bank, Westford Jobs, Westford Foods and the other practice websites arrive here. You can write back. Nothing is sent to a real email address.

Westford Mail`,
      at,
      scenario: "mail",
      eventKey: "mail.welcome",
    }),
    letter({
      holder,
      from: "bank",
      subject: "Your Westford Bank account is open",
      body: `Dear ${holder.fullName},

Your practice current account is open.

Sort code: ${details.sortCode}
Account number: ${details.accountNumber}

The money in this account is pretend. Westford Bank will never ask you to send a card number or security code by email.

Westford Bank`,
      at,
      scenario: "bank",
      eventKey: "bank.opened",
    }),
  ];
}

export function movementMail(
  holder: MailHolder,
  details: { description: string; amountPence: number; reference: string; paidAt: string; balancePence: number; kind: "card" | "transfer" | "in" },
): MailDraft[] {
  const direction = details.kind === "in" ? "in" : "out";
  const verb = details.kind === "in" ? "paid in" : details.kind === "transfer" ? "sent" : "paid";
  return [
    letter({
      holder,
      from: "bank",
      subject: details.kind === "in" ? "Money paid into your account" : `Payment to ${details.description}`,
      body: `Dear ${holder.fullName},

You ${verb} ${pounds(details.amountPence)} ${direction === "in" ? "to" : "from"} your Westford Bank account.

Details: ${details.description}
Reference: ${details.reference}
Date: ${mailDate(details.paidAt)}
Balance after this: ${pounds(details.balancePence)}

You can see the same payment under Transactions in Westford Bank.

Westford Bank`,
      at: details.paidAt,
      scenario: "bank",
      eventKey: `bank.${details.kind}:${details.reference}:${details.paidAt}`,
      eventRef: details.reference,
    }),
  ];
}

export function foodsOrderMail(holder: MailHolder, details: { reference: string; amountPence: number; paidAt: string }): MailDraft[] {
  return [
    letter({
      holder,
      from: "foods",
      subject: `Order ${details.reference} confirmed`,
      body: `Dear ${holder.fullName},

Thank you for your Westford Foods order.

Order number: ${details.reference}
Amount paid: ${pounds(details.amountPence)}
Date: ${mailDate(details.paidAt)}

This is a practice delivery. No food will be sent to your address. The card payment is also listed in Westford Bank.

Westford Foods`,
      at: details.paidAt,
      scenario: "shop",
      eventKey: `foods.order:${details.reference}`,
      eventRef: details.reference,
    }),
  ];
}

export function energyPaymentMail(
  holder: MailHolder,
  details: { accountNumber: string; amountPence: number; reference: string; paidAt: string; method: string },
): MailDraft[] {
  return [
    letter({
      holder,
      from: "energy",
      subject: `Payment received — ${details.reference}`,
      body: `Dear ${holder.fullName},

We have received ${pounds(details.amountPence)} for electricity account ${details.accountNumber}.

Reference: ${details.reference}
Paid by: ${details.method}
Date: ${mailDate(details.paidAt)}

The same amount has left your Westford Bank account. This bill is for practice only.

Westford Energy`,
      at: details.paidAt,
      scenario: "energy",
      eventKey: `energy.payment:${details.reference}`,
      eventRef: details.reference,
    }),
  ];
}

export function meterMail(holder: MailHolder, details: { accountNumber: string; reading: number; readOn: string; at: string }): MailDraft[] {
  return [
    letter({
      holder,
      from: "energy",
      subject: "Meter reading received",
      body: `Dear ${holder.fullName},

Thank you for the electricity reading for account ${details.accountNumber}.

Reading: ${details.reading}
Date of reading: ${mailDate(`${details.readOn}T12:00:00Z`)}

We will use this figure the next time we work out a practice bill.

Westford Energy`,
      at: details.at,
      scenario: "energy",
      eventKey: `energy.reading:${details.readOn}:${details.reading}`,
      eventRef: details.accountNumber,
    }),
  ];
}

export function directDebitMail(holder: MailHolder, details: { accountNumber: string; day: number; at: string }): MailDraft[] {
  return [
    letter({
      holder,
      from: "energy",
      subject: "Direct Debit set up",
      body: `Dear ${holder.fullName},

A practice Direct Debit is set up on electricity account ${details.accountNumber}. The collection day is the ${details.day} of each month.

No real money will be collected. You can cancel it from Westford Energy.

Westford Energy`,
      at: details.at,
      scenario: "energy",
      eventKey: `energy.direct-debit:${details.at}`,
      eventRef: details.accountNumber,
    }),
  ];
}

export function serviceMail(
  holder: MailHolder,
  details: { from: MailOrgId; scenario: string; subject: string; body: string; at: string; eventKey: string; eventRef: string },
): MailDraft[] {
  return [letter({ holder, from: details.from, subject: details.subject, body: details.body, at: details.at, scenario: details.scenario, eventKey: details.eventKey, eventRef: details.eventRef })];
}

export function jobApplicationMail(
  holder: MailHolder,
  details: {
    reference: string;
    title: string;
    employer: string;
    status: "submitted" | "under_review" | "interview" | "unsuccessful";
    submittedAt: string;
    cvFileName: string;
    interview: { date: string; time: string; location: string } | null;
  },
): MailDraft[] {
  const attachment = details.cvFileName ? [{ name: details.cvFileName }] : [];
  const received = letter({
    holder,
    from: "jobs",
    subject: `Application received — ${details.reference}`,
    body: `Dear ${holder.fullName},

${details.employer} has your practice application for ${details.title}.

Reference: ${details.reference}
Submitted: ${mailDate(details.submittedAt)}

The application is saved in My applications on Westford Jobs. It has not been sent to a real employer.

Westford Jobs`,
    at: details.submittedAt,
    scenario: "jobs",
    eventKey: `jobs.received:${details.reference}`,
    eventRef: details.reference,
    attachments: attachment,
  });
  const later = new Date(new Date(details.submittedAt).getTime() + FOLLOW_UP_DELAY_MS).toISOString();
  if (details.status === "interview" && details.interview) {
    return [
      received,
      letter({
        holder,
        from: "jobs",
        subject: `Interview invitation — ${details.reference}`,
        body: `Dear ${holder.fullName},

${details.employer} would like to meet you about the ${details.title} role.

Date: ${mailDate(`${details.interview.date}T12:00:00Z`)}
Time: ${details.interview.time}
Place: ${details.interview.location}
Reference: ${details.reference}

Please arrive 10 minutes early and ask for reception. Do not bring payment or copies of identity documents. You can also see this invitation in My applications.

Westford Jobs`,
        at: details.submittedAt,
        visibleAt: later,
        scenario: "jobs",
        eventKey: `jobs.outcome:${details.reference}`,
        eventRef: details.reference,
      }),
    ];
  }
  if (details.status === "unsuccessful") {
    return [
      received,
      letter({
        holder,
        from: "jobs",
        subject: `Update on your application — ${details.reference}`,
        body: `Dear ${holder.fullName},

Thank you for applying for ${details.title} at ${details.employer}. We will not be taking this practice application further.

Reference: ${details.reference}

You can apply for another vacancy on Westford Jobs.

Westford Jobs`,
        at: details.submittedAt,
        visibleAt: later,
        scenario: "jobs",
        eventKey: `jobs.outcome:${details.reference}`,
        eventRef: details.reference,
      }),
    ];
  }
  if (details.status === "under_review") {
    return [
      received,
      letter({
        holder,
        from: "jobs",
        subject: `A question about application ${details.reference}`,
        body: `Dear ${holder.fullName},

${details.employer} is looking at your application for ${details.title}. Please reply to this email to confirm the telephone number on the form.

Reference: ${details.reference}

Westford Jobs`,
        at: details.submittedAt,
        visibleAt: later,
        scenario: "jobs",
        eventKey: `jobs.outcome:${details.reference}`,
        eventRef: details.reference,
      }),
    ];
  }
  return [received];
}

export type Outgoing = { to: string; subject: string; message: string; attachmentName: string | null; inReplyTo: number | null };

export function checkOutgoing(body: Record<string, unknown>): { ok: true; value: Outgoing } | { ok: false; errors: Record<string, string> } {
  const to = typeof body.to === "string" ? body.to.trim().toLowerCase() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 120) : "";
  const message = typeof body.body === "string" ? body.body.trim().slice(0, 2000) : "";
  const attachmentName = typeof body.attachmentName === "string" ? body.attachmentName.trim().slice(0, 80) : "";
  const inReplyTo = typeof body.inReplyTo === "number" && Number.isInteger(body.inReplyTo) ? body.inReplyTo : null;
  const errors: Record<string, string> = {};
  if (!findOrg(to)) errors.to = "Use an address from the list. Westford Mail only delivers to practice organisations.";
  if (subject.length < 3) errors.subject = "Add a subject of at least 3 letters.";
  if (message.length < 10) errors.body = "Write a short message (at least 10 letters).";
  if (attachmentName && (!FILE_NAME.test(attachmentName) || !SAFE_EXTENSIONS.some((ext) => attachmentName.toLowerCase().endsWith(ext)))) {
    errors.attachmentName = "Use a practice file name ending in pdf, txt, doc, docx, jpg or png.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { to, subject, message, attachmentName: attachmentName || null, inReplyTo } };
}

function mentions(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

export function organisationReply(
  orgId: MailOrgId,
  holder: MailHolder,
  subject: string,
  body: string,
  attachmentName: string | null,
  context: ReplyContext,
): string {
  const file = attachmentName ? `\n\nWe have noted the file “${attachmentName}”. The file itself stays on your device and is not kept by Computer Steps.` : "";
  const sign = (name: string, text: string) => `Dear ${holder.fullName},\n\n${text}${file}\n\nThis reply exists only inside Computer Steps.\n\n${name}`;
  const asked = `${subject}\n${body}`;
  if (orgId === "bank") {
    if (mentions(asked, /balance|how much|transaction|payment|transfer|spent|taken/i) && context.transactions.length > 0) {
      const lines = context.transactions
        .map((item) => `${mailDate(item.postedAt)} — ${item.description} — ${pounds(item.amountPence)}${item.reference ? ` (${item.reference})` : ""}`)
        .join("\n");
      const balance = context.balancePence === null ? "" : `\n\nThe balance on the practice account is ${pounds(context.balancePence)}.`;
      return sign("Westford Bank", `Here are the latest movements on your account:\n\n${lines}${balance}\n\nOpen Transactions in Westford Bank to see the full list.`);
    }
    if (context.balancePence !== null && mentions(asked, /balance|how much/i)) {
      return sign("Westford Bank", `The balance on your practice account is ${pounds(context.balancePence)}.`);
    }
    return sign("Westford Bank", "Thank you for your message. A member of the practice team has logged it against your Westford Bank account. If you tell us the payment reference, we can point you to that line in Transactions.");
  }
  if (orgId === "jobs" && context.application) {
    return sign(
      "Westford Jobs",
      `Thank you for writing about ${context.application.title} at ${context.application.employer}. The application reference is ${context.application.reference} and the status is ${context.application.status.replaceAll("_", " ")}. You can see the same record in My applications.`,
    );
  }
  if (orgId === "council") {
    const ref = context.councilReference ? ` Your latest request reference is ${context.councilReference}.` : "";
    return sign("Westford Council", `Thank you for contacting Westford Council.${ref} You can check the status in My Account on the council website.`);
  }
  if (orgId === "energy") {
    const account = context.energyAccount ? ` Your electricity account number is ${context.energyAccount}.` : "";
    return sign("Westford Energy", `Thank you for your message.${account} Bills, readings and payments are on the Westford Energy website.`);
  }
  if (orgId === "gp") {
    const script = context.prescriptionReference ? ` Your latest prescription reference is ${context.prescriptionReference}.` : "";
    return sign(
      "Yama Clinic",
      `Thank you for your message.${script} For a routine practice appointment, the next free slot we can offer is in 8 days. Use Contact us online, or call 01632 960 482 during opening hours. If someone is seriously unwell, this practice website is not the right place to get help.`,
    );
  }
  if (orgId === "deliveries") {
    const code = asked.match(/WF\d{6,}/i)?.[0]?.toUpperCase();
    return sign("Westford Deliveries", code ? `We have noted tracking code ${code}. Open Westford Deliveries and enter that code to see the latest practice status.` : "Please reply with the tracking code from your parcel label. It looks like WF48271936.");
  }
  if (orgId === "mobile") {
    const number = context.mobileNumber ? ` The practice number on your account is ${context.mobileNumber}.` : "";
    return sign("Westford Mobile", `Thank you for your message.${number} Bills and usage are on the Westford Mobile website.`);
  }
  if (orgId === "travel") return sign("Westford Travel", "Thank you for your message. Booking references are listed in My trips on Westford Travel.");
  if (orgId === "foods") return sign("Westford Foods", "Thank you for your message. Order numbers look like the reference on your confirmation email, and the card payment is in Westford Bank.");
  return sign("Westford Mail", "Thank you. Your message is saved in Sent.");
}

export function replySubject(subject: string): string {
  return subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;
}
