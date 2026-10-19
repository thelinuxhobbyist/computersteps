"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { clearLearner, useLearner } from "../../lib/learner-session";
import { getMailbox, markRead, sendMail, type Mailbox, type MailMessage } from "./mail-api";

type Folder = "inbox" | "sent" | "compose";

const FILE_TYPES = [".pdf", ".txt", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

function when(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(new Date(iso));
}

export default function MailboxApp() {
  const username = useLearner();
  const [mailbox, setMailbox] = useState<Mailbox | "missing" | "error" | null>(null);
  const [folder, setFolder] = useState<Folder>("inbox");
  const [openId, setOpenId] = useState<number | null>(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async (name: string) => {
    const next = await getMailbox(name);
    setMailbox(next);
  }, []);

  useEffect(() => {
    if (!username) return;
    const timer = window.setTimeout(() => void load(username), 0);
    return () => window.clearTimeout(timer);
  }, [username, load]);

  useEffect(() => {
    if (!username || !mailbox || mailbox === "missing" || mailbox === "error" || mailbox.pending < 1) return;
    const timer = window.setInterval(() => void load(username), 20000);
    return () => window.clearInterval(timer);
  }, [username, mailbox, load]);

  const messages = mailbox && mailbox !== "missing" && mailbox !== "error" ? mailbox.messages : [];
  const visible = messages.filter((message) => message.mailbox === (folder === "sent" ? "sent" : "inbox"));
  const open = messages.find((message) => message.id === openId) ?? null;
  const thread = useMemo(() => (open ? messages.filter((message) => message.conversationId === open.conversationId) : []), [messages, open]);
  const unread = messages.filter((message) => message.mailbox === "inbox" && !message.read).length;

  const openMessage = (message: MailMessage) => {
    setOpenId(message.id);
    setFolder(message.mailbox);
    if (username && message.mailbox === "inbox" && !message.read) {
      void markRead(username, message.id);
      setMailbox((current) => {
        if (!current || current === "missing" || current === "error") return current;
        return { ...current, messages: current.messages.map((item) => (item.id === message.id ? { ...item, read: true } : item)) };
      });
    }
  };

  const startCompose = (next?: { to: string; subject: string; replyTo: number }) => {
    setTo(next?.to ?? "");
    setSubject(next?.subject ?? "");
    setBody("");
    setAttachmentName(null);
    setReplyTo(next?.replyTo ?? null);
    setErrors({});
    setNotice("");
    setFolder("compose");
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!FILE_TYPES.some((ext) => lower.endsWith(ext))) {
      setErrors((current) => ({ ...current, attachmentName: "Use a pdf, txt, doc, docx, jpg or png file." }));
      return;
    }
    setAttachmentName(file.name);
    setErrors((current) => ({ ...current, attachmentName: "" }));
  };

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!username) return;
    setSending(true);
    const result = await sendMail(username, { to, subject, body, attachmentName: attachmentName ?? undefined, inReplyTo: replyTo ?? undefined });
    setSending(false);
    if (!result.ok && "errors" in result) {
      setErrors(result.errors);
      return;
    }
    if (!result.ok) {
      setNotice("We could not send that message. Check you are connected to the internet, then try again.");
      return;
    }
    setNotice("");
    setFolder("inbox");
    setOpenId(null);
    await load(username);
  };

  if (username === undefined || (username && mailbox === null)) return <p className="wm-wrap">Loading your inbox…</p>;

  if (!username) {
    return (
      <div className="wm-wrap wm-narrow">
        <h1>Sign in to Westford Mail</h1>
        <p>Use the same Computer Steps username you use for Westford Bank and the other practice websites.</p>
        <ScenarioSignIn onSignedIn={() => setMailbox(null)} />
      </div>
    );
  }

  if (mailbox === "missing") {
    return (
      <div className="wm-wrap wm-narrow">
        <h1>We can't find that account</h1>
        <p>Open a Computer Steps account on Westford Bank, then come back here.</p>
        <button type="button" className="wm-btn" onClick={() => clearLearner()}>
          Use a different username
        </button>
      </div>
    );
  }

  if (mailbox === "error" || mailbox === null) {
    return (
      <div className="wm-wrap wm-narrow">
        <h1>Westford Mail is not available</h1>
        <p>Check you are connected to the internet, then try again.</p>
        <button type="button" className="wm-btn" onClick={() => void load(username)}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="wm-wrap">
      <div className="wm-top">
        <div>
          <h1>Inbox</h1>
          <p>
            {mailbox.address}
            <span> · {mailbox.fullName}</span>
          </p>
        </div>
        <button type="button" className="wm-text" onClick={() => clearLearner()}>
          Sign out
        </button>
      </div>

      <p className="wm-note">
        Messages stay for {mailbox.retentionDays} days, then Westford Mail deletes them. Your applications, orders and payments stay on the websites they belong to. Nothing here is sent to a real email address.
        {mailbox.pending > 0 ? " Another message is on its way." : ""}
      </p>

      <div className="wm-layout">
        <div className="wm-folders" role="tablist" aria-label="Folders">
          <button type="button" role="tab" aria-selected={folder === "inbox"} onClick={() => { setFolder("inbox"); setOpenId(null); }}>
            Inbox{unread > 0 ? ` (${unread})` : ""}
          </button>
          <button type="button" role="tab" aria-selected={folder === "sent"} onClick={() => { setFolder("sent"); setOpenId(null); }}>
            Sent
          </button>
          <button type="button" className="wm-btn" onClick={() => startCompose()}>
            New message
          </button>
        </div>

        {folder === "compose" ? (
          <form className="wm-read" onSubmit={onSend}>
            <h2>{replyTo ? "Reply" : "New message"}</h2>
            <label htmlFor="wm-to">To</label>
            <input id="wm-to" list="wm-orgs" value={to} autoComplete="off" onChange={(event) => setTo(event.target.value)} />
            <datalist id="wm-orgs">
              {mailbox.organisations.filter((item) => item.id !== "mail").map((item) => (
                <option key={item.id} value={item.address}>{item.name}</option>
              ))}
            </datalist>
            {errors.to ? <p className="wm-error">{errors.to}</p> : null}
            <label htmlFor="wm-subject">Subject</label>
            <input id="wm-subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
            {errors.subject ? <p className="wm-error">{errors.subject}</p> : null}
            <label htmlFor="wm-body">Message</label>
            <textarea id="wm-body" rows={10} value={body} onChange={(event) => setBody(event.target.value)} />
            {errors.body ? <p className="wm-error">{errors.body}</p> : null}
            <label className="wm-file" htmlFor="wm-file">
              <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" /> Add a practice attachment
              <input id="wm-file" type="file" onChange={(event) => onFile(event.target.files?.[0])} />
            </label>
            {attachmentName ? <p>File name recorded: {attachmentName}. The file stays on this device.</p> : null}
            {errors.attachmentName ? <p className="wm-error">{errors.attachmentName}</p> : null}
            {notice ? <p className="wm-error">{notice}</p> : null}
            <button type="submit" className="wm-btn" disabled={sending}>
              <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" /> {sending ? "Sending…" : "Send"}
            </button>
          </form>
        ) : open ? (
          <article className="wm-read">
            <button type="button" className="wm-text" onClick={() => setOpenId(null)}>
              Back to {open.mailbox === "sent" ? "Sent" : "Inbox"}
            </button>
            <h2>{open.subject}</h2>
            <p className="wm-meta">
              {open.mailbox === "sent" ? `To ${open.toName} <${open.toAddress}>` : `From ${open.fromName} <${open.fromAddress}>`}
              <br />
              {when(open.sentAt)}
              {open.eventRef ? ` · Reference ${open.eventRef}` : ""}
            </p>
            {open.attachments.map((file) => (
              <p key={file.name} className="wm-file-pill">
                <FontAwesomeIcon icon={faPaperclip} aria-hidden="true" /> {file.name}
              </p>
            ))}
            {open.body.split("\n").map((line, index) => (
              <p key={`${open.id}-${index}`}>{line || "\u00a0"}</p>
            ))}
            {thread.length > 1 ? (
              <section>
                <h3>This conversation</h3>
                <ul className="wm-thread">
                  {thread.map((message) => (
                    <li key={message.id}>
                      <button type="button" onClick={() => openMessage(message)}>
                        {message.mailbox === "sent" ? "You" : message.fromName}: {message.subject}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {open.mailbox === "inbox" ? (
              <button
                type="button"
                className="wm-btn"
                onClick={() => startCompose({ to: open.fromAddress, subject: open.subject.startsWith("Re:") ? open.subject : `Re: ${open.subject}`, replyTo: open.id })}
              >
                Reply
              </button>
            ) : null}
          </article>
        ) : (
          <div className="wm-list">
            {visible.length === 0 ? <p>No messages in {folder === "sent" ? "Sent" : "Inbox"} yet.</p> : null}
            <ul>
              {visible.map((message) => (
                <li key={message.id}>
                  <button type="button" className={message.read ? "" : "is-unread"} onClick={() => openMessage(message)}>
                    <span>{message.mailbox === "sent" ? message.toName : message.fromName}</span>
                    <strong>{message.subject}</strong>
                    <time dateTime={message.sentAt}>{when(message.sentAt)}</time>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="wm-addresses">
        Practice addresses: {mailbox.organisations.filter((item) => item.id !== "mail").map((item) => item.address).join(", ")}.{" "}
        <Link href="/scenarios/">Back to scenarios</Link>
      </p>
    </div>
  );
}
