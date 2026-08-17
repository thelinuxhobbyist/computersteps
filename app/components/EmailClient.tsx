"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileArrowUp, faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { uploadFileToWorker } from "../lib/upload";
import { isAnswerCorrect, isFileSafeForUpload } from "../lesson-utils";
import {
  DEFAULT_INBOX_IDS,
  PRACTICE_USER_EMAIL,
  contactInitials,
  emailBodyParagraphs,
  getContact,
  inboxFromContactIds,
  resolveContactId,
} from "../lessons/email-data";
import type { LessonStep } from "../lessons/types";

type Screen = "inbox" | "read" | "compose";

type EmailClientProps = {
  step: LessonStep;
  stepComplete: boolean;
  onSuccess: () => void;
  onError: () => void;
};

function matchesRecipient(value: string, expected?: string): boolean {
  if (!expected) return true;

  const trimmed = value.trim().toLowerCase();
  const contact = getContact(expected);

  return (
    trimmed === contact.email.toLowerCase()
    || trimmed === contact.name.toLowerCase()
    || resolveContactId(expected) === resolveContactId(trimmed)
  );
}

export default function EmailClient({ step, stepComplete, onSuccess, onError }: EmailClientProps) {
  const inboxIds = step.options?.map(resolveContactId) ?? DEFAULT_INBOX_IDS;

  const readContact = step.type === "replyEmail" || step.type === "downloadAttachment" || step.type === "backToInbox"
    ? getContact(step.emailFrom ?? step.expected ?? "tutor")
    : null;

  const [screen, setScreen] = useState<Screen>(() => {
    if (step.type === "openInbox" || step.type === "openEmail" || step.type === "composeEmail" && step.composeStart === "new") {
      return "inbox";
    }
    if (step.type === "replyEmail" || step.type === "downloadAttachment" || step.type === "backToInbox") return "read";
    if (step.type === "composeEmail") return "compose";
    return "inbox";
  });

  const [readMessageId, setReadMessageId] = useState<string | null>(readContact?.id ?? null);
  const [to, setTo] = useState(step.composeTo ?? "");
  const [subject, setSubject] = useState(step.composeSubject ?? "");
  const [body, setBody] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const inboxMessages = inboxFromContactIds(
    inboxIds,
    step.type === "openEmail" ? step.expected : undefined,
  );

  const viewedContact = readMessageId ? getContact(readMessageId) : readContact;

  const trySuccess = () => {
    if (!stepComplete) onSuccess();
  };

  const tryFail = () => {
    if (!stepComplete) onError();
  };

  const handleInboxOpen = () => {
    setScreen("inbox");
    if (step.type === "openInbox") trySuccess();
  };

  const handleNewClick = () => {
    setTo("");
    setSubject("");
    setBody("");
    setAttachmentName(null);
    setScreen("compose");
  };

  const handleMessageClick = (contactId: string) => {
    const resolved = resolveContactId(contactId);
    setReadMessageId(resolved);
    setScreen("read");

    if (step.type === "openEmail") {
      if (resolveContactId(step.expected ?? "") === resolved) {
        trySuccess();
      } else {
        tryFail();
      }
    }
  };

  const handleBack = () => {
    if (screen === "compose") {
      if (readMessageId) {
        setScreen("read");
      } else {
        setScreen("inbox");
      }
      return;
    }

    if (screen === "read") {
      setScreen("inbox");
      if (step.type === "backToInbox") trySuccess();
    }
  };

  const handleReplyClick = () => {
    if (viewedContact) {
      setTo(viewedContact.email);
      setSubject(viewedContact.subject.startsWith("Re:") ? viewedContact.subject : `Re: ${viewedContact.subject}`);
    }
    setBody("");
    setAttachmentName(null);
    setScreen("compose");
  };

  const handleSend = () => {
    if (step.type === "replyEmail") {
      if (isAnswerCorrect(body, step.expected)) {
        trySuccess();
      } else {
        tryFail();
      }
      return;
    }

    if (step.type === "composeEmail") {
      if (step.expectedTo && !matchesRecipient(to, step.expectedTo)) {
        tryFail();
        return;
      }
      if (step.expectedSubject && !isAnswerCorrect(subject, step.expectedSubject)) {
        tryFail();
        return;
      }
      if (step.expected && step.expected !== "send" && !isAnswerCorrect(body, step.expected)) {
        tryFail();
        return;
      }
      if (step.requireAttachment && !attachmentName) {
        tryFail();
        return;
      }
      trySuccess();
    }
  };

  const handleAttach = async (file: File) => {
    if (!isFileSafeForUpload(file)) {
      tryFail();
      return;
    }

    setUploading(true);
    const uploaded = await uploadFileToWorker(file);
    setUploading(false);

    if (!uploaded) {
      tryFail();
      return;
    }

    setAttachmentName(file.name);
  };

  const showInboxHighlight = step.type === "openInbox" || step.type === "openEmail";
  const showNewHighlight = step.type === "composeEmail" && step.composeStart === "new" && screen === "inbox";
  const showReplyHighlight = step.type === "replyEmail" && screen === "read";
  const showDownloadHighlight = step.type === "downloadAttachment";
  const showBackHighlight = step.type === "backToInbox" && screen === "read";
  const composeBackLabel = readMessageId ? "Back to message" : "Back to Inbox";

  return (
    <div className="email-app">
      <div className="email-app__titlebar">
        <span className="email-app__title">Practice email</span>
        <span className="email-app__badge">Nothing is really sent</span>
      </div>

      {screen !== "read" ? (
        <div className="email-app__toolbar">
          <button
            type="button"
            className={`email-app__tool ${showNewHighlight ? "is-active" : ""} ${screen === "compose" && step.type === "composeEmail" ? "is-active" : ""}`}
            onClick={handleNewClick}
          >
            New
          </button>
          <button
            type="button"
            className={`email-app__tool ${showInboxHighlight && screen === "inbox" ? "is-active" : ""}`}
            onClick={handleInboxOpen}
          >
            Inbox
          </button>
        </div>
      ) : null}

      {screen === "inbox" ? (
        <div className="email-app__inbox">
          <div className="email-app__inbox-head">
            <span>Who sent it</span>
            <span>Subject</span>
          </div>
          {inboxMessages.map((message) => (
            <button
              key={message.id}
              type="button"
              className={`email-app__message ${message.selected ? "is-selected" : ""}`}
              onClick={() => handleMessageClick(message.id)}
            >
              <span className="email-app__message-from">{message.name}</span>
              <span className="email-app__message-subject">{message.subject}</span>
            </button>
          ))}
          {step.type === "composeEmail" && step.composeStart === "new" ? (
            <p className="email-app__hint">Click <strong>New</strong> to write an email.</p>
          ) : null}
        </div>
      ) : null}

      {screen === "read" && viewedContact ? (
        <div className="email-app__read">
          <div className="email-app__screen-head">
            <button type="button" className={`email-app__back ${showBackHighlight ? "is-target" : ""}`} onClick={handleBack}>
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
              Back to Inbox
            </button>
          </div>

          <div className="email-app__read-panel">
            <div className="email-app__sender">
              <div className="email-app__avatar" aria-hidden="true">
                {contactInitials(viewedContact.name)}
              </div>
              <div className="email-app__sender-meta">
                <p className="email-app__sender-name">{viewedContact.name}</p>
                <p className="email-app__sender-email">{viewedContact.email}</p>
              </div>
            </div>

            <p className="email-app__read-subject">{step.emailSubject ?? viewedContact.subject}</p>

            <div className="email-app__read-content">
              {emailBodyParagraphs(step.emailBody ?? viewedContact.preview).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {step.type === "downloadAttachment" ? (
              <div className={`email-app__attachment-row ${showDownloadHighlight ? "is-target" : ""}`}>
                <span className="email-app__attachment-chip">
                  <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" />
                  {step.expected ?? "attachment.pdf"}
                </span>
                <button type="button" className="email-app__download" onClick={trySuccess}>
                  Download
                </button>
              </div>
            ) : null}

            {step.type === "replyEmail" ? (
              <div className="email-app__read-actions">
                <button
                  type="button"
                  className={`email-app__reply ${showReplyHighlight ? "is-target" : ""}`}
                  onClick={handleReplyClick}
                >
                  Reply
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {screen === "compose" ? (
        <>
          <div className="email-app__screen-head">
            <button type="button" className="email-app__back" onClick={handleBack}>
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
              {composeBackLabel}
            </button>
          </div>
          <div className="email-app__compose-panel">
            <div className="email-app__fields">
              <div className="email-field">
                <span className="email-field__label">From</span>
                <span className="email-field__value">{PRACTICE_USER_EMAIL}</span>
              </div>
              <div className="email-field">
                <span className="email-field__label">To</span>
                <input
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  placeholder="name or email address"
                  className="email-field__input"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="email-field">
                <span className="email-field__label">Subject</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Subject"
                  className="email-field__input"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="email-app__compose-body">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your message here…"
                className="email-app__textarea"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="email-app__attach-row">
              <span className="email-app__attach-label">
                <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" />
                Attachment
              </span>
              <label className="email-app__attach-button">
                <input
                  type="file"
                  className="hidden"
                  disabled={uploading || stepComplete}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleAttach(file);
                  }}
                />
                <FontAwesomeIcon icon={faFileArrowUp} aria-hidden="true" />
                {uploading ? "Uploading…" : attachmentName ? `Attached: ${attachmentName}` : "Attach file from computer"}
              </label>
            </div>

            <div className="email-app__read-actions">
              <button
                type="button"
                className={`email-app__reply ${stepComplete ? "is-success" : ""}`}
                onClick={handleSend}
                disabled={stepComplete}
              >
                <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />
                Send
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
