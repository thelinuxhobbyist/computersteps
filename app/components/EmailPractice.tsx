"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";
import { PRACTICE_USER_EMAIL, senderAddress } from "../lessons/email-data";

export { PRACTICE_USER_EMAIL, senderAddress };

type EmailPracticeProps = {
  view: "inbox" | "read" | "compose";
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  attachment?: string | null;
  activeField?: "inbox" | "to" | "subject" | "body" | "attach" | "send" | "reply" | "download";
  inboxMessages?: Array<{ from: string; subject: string; selected?: boolean }>;
  onInboxClick?: () => void;
  onMessageClick?: (from: string) => void;
  onReplyClick?: () => void;
  onDownloadClick?: () => void;
  toInput?: ReactNode;
  subjectInput?: ReactNode;
  bodyInput?: ReactNode;
  attachInput?: ReactNode;
  sendButton?: ReactNode;
  toolbarAction?: ReactNode;
};

export default function EmailPractice({
  view,
  from = PRACTICE_USER_EMAIL,
  to = "",
  subject = "",
  body = "",
  attachment = null,
  activeField,
  inboxMessages = [],
  onInboxClick,
  onMessageClick,
  onReplyClick,
  onDownloadClick,
  toInput,
  subjectInput,
  bodyInput,
  attachInput,
  sendButton,
  toolbarAction,
}: EmailPracticeProps) {
  return (
    <div className="email-app">
      <div className="email-app__titlebar">
        <span className="email-app__title">Practice Email</span>
        <span className="email-app__badge">Safe practice — not real email</span>
      </div>

      <div className="email-app__toolbar">
        <button type="button" className="email-app__tool" disabled>
          New
        </button>
        <button
          type="button"
          className={`email-app__tool ${activeField === "inbox" ? "is-active" : ""}`}
          onClick={onInboxClick}
          disabled={!onInboxClick}
        >
          Inbox
        </button>
        {toolbarAction}
      </div>

      {view === "inbox" ? (
        <div className="email-app__inbox">
          <div className="email-app__inbox-head">
            <span>From</span>
            <span>Subject</span>
          </div>
          {inboxMessages.map((message) => (
            <button
              key={`${message.from}-${message.subject}`}
              type="button"
              className={`email-app__message ${message.selected ? "is-selected" : ""} ${activeField === "inbox" ? "is-target" : ""}`}
              onClick={() => onMessageClick?.(message.from)}
              disabled={!onMessageClick}
            >
              <span className="email-app__message-from">{senderAddress(message.from)}</span>
              <span className="email-app__message-subject">{message.subject}</span>
            </button>
          ))}
        </div>
      ) : null}

      {view === "read" ? (
        <div className="email-app__read">
          <div className={`email-field ${activeField === "reply" ? "is-target" : ""}`}>
            <span className="email-field__label">From</span>
            <span className="email-field__value">{from}</span>
          </div>
          <div className="email-field">
            <span className="email-field__label">To</span>
            <span className="email-field__value">{to || PRACTICE_USER_EMAIL}</span>
          </div>
          <div className="email-field">
            <span className="email-field__label">Subject</span>
            <span className="email-field__value">{subject || "Message for you"}</span>
          </div>
          {attachment ? (
            <div className={`email-app__attachment-row ${activeField === "download" ? "is-target" : ""}`}>
              <span className="email-app__attachment-chip">
                <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" />
                {attachment}
              </span>
              {onDownloadClick ? (
                <button type="button" className="email-app__download" onClick={onDownloadClick}>
                  Download
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="email-app__read-body">{body || "Hello,\n\nThank you for using Computer Steps."}</div>
          {onReplyClick ? (
            <div className="email-app__actions">
              <button
                type="button"
                className={`email-app__send ${activeField === "reply" ? "is-target" : ""}`}
                onClick={onReplyClick}
              >
                Reply
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {view === "compose" ? (
        <>
          <div className="email-app__fields">
            <div className="email-field">
              <span className="email-field__label">From</span>
              <span className="email-field__value">{PRACTICE_USER_EMAIL}</span>
            </div>
            <div className={`email-field ${activeField === "to" ? "is-target" : ""}`}>
              <span className="email-field__label">To</span>
              {toInput ?? <span className="email-field__value email-field__value--empty">{to || "email address"}</span>}
            </div>
            <div className={`email-field ${activeField === "subject" ? "is-target" : ""}`}>
              <span className="email-field__label">Subject</span>
              {subjectInput ?? <span className="email-field__value email-field__value--empty">{subject || "subject line"}</span>}
            </div>
          </div>

          <div className={`email-app__compose-body ${activeField === "body" ? "is-target" : ""}`}>
            {bodyInput ?? (
              <div className="email-app__body-placeholder">{body || "Write your message here…"}</div>
            )}
          </div>

          <div className={`email-app__attach-row ${activeField === "attach" ? "is-target" : ""}`}>
            <span className="email-app__attach-label">
              <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" />
              Attachment
            </span>
            {attachInput ?? (
              <span className="email-app__attach-name">{attachment ?? "No file attached"}</span>
            )}
          </div>

          <div className={`email-app__actions ${activeField === "send" ? "is-target" : ""}`}>
            {sendButton ?? (
              <button type="button" className="email-app__send" disabled>
                <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />
                Send
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
