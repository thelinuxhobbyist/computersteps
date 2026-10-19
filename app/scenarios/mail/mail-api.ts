import { request } from "../practice-bank/bank-api";

export type MailAttachment = { name: string };

export type MailMessage = {
  id: number;
  mailbox: "inbox" | "sent";
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  subject: string;
  body: string;
  sentAt: string;
  read: boolean;
  conversationId: string;
  scenario: string;
  eventRef: string | null;
  attachments: MailAttachment[];
};

export type Mailbox = {
  address: string;
  fullName: string;
  username: string;
  retentionDays: number;
  organisations: { id: string; name: string; address: string }[];
  pending: number;
  messages: MailMessage[];
};

export async function getMailbox(username: string): Promise<Mailbox | "missing" | "error"> {
  const result = await request(`/mail/${encodeURIComponent(username)}`);
  if (result?.status === 200) return result.body as unknown as Mailbox;
  if (result?.status === 404 && result.body.error === "account_not_found") return "missing";
  return "error";
}

export async function sendMail(
  username: string,
  body: { to: string; subject: string; body: string; attachmentName?: string; inReplyTo?: number },
): Promise<{ ok: true } | { ok: false; errors: Record<string, string> } | { ok: false; reason: "unavailable" }> {
  const result = await request(`/mail/${encodeURIComponent(username)}/send`, { method: "POST", body: JSON.stringify(body) });
  if (result?.status === 201) return { ok: true };
  if (result?.status === 400 && result.body.errors && typeof result.body.errors === "object") {
    return { ok: false, errors: result.body.errors as Record<string, string> };
  }
  return { ok: false, reason: "unavailable" };
}

export async function markRead(username: string, id: number): Promise<void> {
  await request(`/mail/${encodeURIComponent(username)}/read`, { method: "POST", body: JSON.stringify({ id }), quiet: true });
}

export async function recordPracticeEvent(username: string, event: { type: "gp.consultation"; reference: string; reason: string }): Promise<void> {
  await request(`/mail/${encodeURIComponent(username)}/events`, { method: "POST", body: JSON.stringify(event), quiet: true });
}
