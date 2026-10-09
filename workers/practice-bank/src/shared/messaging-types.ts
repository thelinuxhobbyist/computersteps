/** Shared by every practice website that lets learners send a fictional message. */

export type MessageStatus = "received" | "replied";

export type PracticeMessage = {
  id: number;
  sentAt: string;
  topic: string;
  message: string;
  reference: string;
  status: MessageStatus;
  replyAt: string | null;
  replyBody: string | null;
};
