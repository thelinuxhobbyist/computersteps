"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { clearLearner, useLearner } from "../../lib/learner-session";
import { getMailbox, markRead, saveDraft, sendMail, updateMessage, type Mailbox, type MailFolder, type MailMessage } from "./mail-api";

type Folder = MailFolder | "starred";

const FOLDERS: { id: Folder; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "starred", label: "Starred" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
  { id: "spam", label: "Spam" },
  { id: "bin", label: "Bin" },
];

const ICONS: Record<string, string> = {
  write: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  search: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  inbox: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H5V5h14v10z",
  starred: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  sent: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
  drafts: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  spam: "M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z",
  bin: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  clip: "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
};

const PRACTICE_FILES = [
  { name: "ComputerSteps-sample-CV.txt", size: "4 KB" },
  { name: "electricity-bill.pdf", size: "86 KB" },
  { name: "photo-of-meter.jpg", size: "1.2 MB" },
];

const FILE_TYPES = [".pdf", ".txt", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

type AttachedFile = { name: string; size: string };

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeFileName(name: string): boolean {
  return /^[\w .\-()]{1,80}$/.test(name) && FILE_TYPES.some((ext) => name.toLowerCase().endsWith(ext));
}

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function when(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(date);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" }).format(date);
}

function inFolder(message: MailMessage, folder: Folder): boolean {
  if (folder === "starred") return message.starred && message.folder !== "bin";
  return message.folder === folder;
}

export default function MailboxApp() {
  const username = useLearner();
  const [mailbox, setMailbox] = useState<Mailbox | "missing" | "error" | null>(null);
  const [folder, setFolder] = useState<Folder>("inbox");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [composeTitle, setComposeTitle] = useState("New email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [warned, setWarned] = useState(false);
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async (name: string) => {
    setMailbox(await getMailbox(name));
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

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const messages = mailbox && mailbox !== "missing" && mailbox !== "error" ? mailbox.messages : [];
  const unread = (id: Folder) => messages.filter((message) => inFolder(message, id) && !message.read && (id === "inbox" || id === "spam")).length;
  const visible = messages.filter((message) => {
    if (!inFolder(message, folder)) return false;
    const haystack = `${message.subject} ${message.body} ${message.fromName} ${message.toAddress}`.toLowerCase();
    return !query.trim() || haystack.includes(query.trim().toLowerCase());
  });
  const open = messages.find((message) => message.id === openId && inFolder(message, folder)) ?? null;

  const show = (message: string) => setToast(message);

  const patch = async (id: number, change: { folder?: MailFolder; starred?: boolean }) => {
    if (!username) return;
    setMailbox((current) => {
      if (!current || current === "missing" || current === "error") return current;
      return {
        ...current,
        messages: current.messages.map((item) => (item.id === id ? { ...item, ...change } : item)),
      };
    });
    await updateMessage(username, { id, ...change });
  };

  const openMessage = (message: MailMessage) => {
    setOpenId(message.id);
    if (username && !message.read && (message.folder === "inbox" || message.folder === "spam")) {
      void markRead(username, message.id);
      setMailbox((current) => {
        if (!current || current === "missing" || current === "error") return current;
        return { ...current, messages: current.messages.map((item) => (item.id === message.id ? { ...item, read: true } : item)) };
      });
    }
  };

  const startCompose = (next?: { title: string; to: string; subject: string; body: string; draftId: number | null; attachments?: AttachedFile[] }) => {
    setComposeTitle(next?.title ?? "New email");
    setTo(next?.to ?? "");
    setSubject(next?.subject ?? "");
    setBody(next?.body ?? "");
    setAttachments(next?.attachments ?? []);
    setDraftId(next?.draftId ?? null);
    setError("");
    setWarned(false);
    setComposing(true);
  };

  const addAttachments = (files: AttachedFile[]) => {
    setAttachments((current) => {
      const next = [...current];
      let problem = "";
      for (const file of files) {
        if (!safeFileName(file.name)) {
          problem = "Use a pdf, txt, doc, docx, jpg or png file.";
          continue;
        }
        if (next.some((item) => item.name === file.name)) continue;
        if (next.length >= 3) {
          problem = "You can attach up to 3 files.";
          break;
        }
        next.push(file);
      }
      const notice = problem;
      queueMicrotask(() => setError(notice));
      return next;
    });
  };

  const closeCompose = async (save: boolean) => {
    if (username && save && (to.trim() || subject.trim() || body.trim() || attachments.length > 0)) {
      await saveDraft(username, { id: draftId ?? undefined, to, subject, body, attachmentNames: attachments.map((file) => file.name) });
      show("Saved in Drafts, in case you want to finish it later.");
      await load(username);
    } else if (username && !save && draftId) {
      await saveDraft(username, { id: draftId, to: "", subject: "", body: "" });
      await load(username);
    }
    setComposing(false);
    setDraftId(null);
  };

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!username) return;
    if (!to.trim()) {
      setError("Add who this email is for. Type an address, or click a practice contact.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setError("That does not look like an email address. It needs a name, then @, then a website ending.");
      return;
    }
    if (subject.trim().length < 3 && !warned) {
      setWarned(true);
      setError("Add a subject of at least 3 letters so the person knows what the email is about. Click Send again if you still want to change it.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Write a short message in the big box (at least 10 letters).");
      return;
    }
    setSending(true);
    const result = await sendMail(username, { to, subject, body, attachmentNames: attachments.map((file) => file.name), draftId: draftId ?? undefined });
    setSending(false);
    if (!result.ok && "errors" in result) {
      setError(Object.values(result.errors)[0] ?? "Check the address and try again.");
      return;
    }
    if (!result.ok) {
      setError("We could not send that message. Check you are connected to the internet, then try again.");
      return;
    }
    setComposing(false);
    setDraftId(null);
    setFolder("inbox");
    setOpenId(null);
    show("Email sent. The reply will appear in your Inbox.");
    await load(username);
  };

  const initial = mailbox && mailbox !== "missing" && mailbox !== "error" ? mailbox.fullName.trim().charAt(0).toUpperCase() || "Y" : "Y";

  return (
    <>
      <header className="wm-head">
        <Link href="/scenarios/mail/" className="wm-logo">
          <span className="wm-mark" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 34 34">
              <rect x="2" y="6" width="30" height="22" rx="4" fill="#fff" />
              <path d="M4 9l13 10L30 9" fill="none" stroke="#b3402f" strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Westford Mail</span>
        </Link>
        <div className="wm-search">
          <Icon name="search" />
          <input type="search" value={query} placeholder="Search your mail" aria-label="Search your mail" onChange={(event) => { setQuery(event.target.value); setOpenId(null); }} />
        </div>
        {username ? (
          <button type="button" className="wm-hbtn" onClick={() => clearLearner()}>
            Sign out
          </button>
        ) : null}
        <div className="wm-av" aria-label="You">{initial}</div>
      </header>
      <div className="wm-banner">
        Practice mode: nothing you write here is sent to a real person. <Link href="/scenarios/">Back to Computer Steps</Link>
      </div>
      <main className="wm-main">
        <nav className="wm-nav" aria-label="Folders">
          <button type="button" className="wm-compose" onClick={() => startCompose()}>
            <Icon name="write" />
            <span className="wm-label">Write email</span>
          </button>
          {FOLDERS.map((item) => {
            const count = item.id === "inbox" || item.id === "spam" ? unread(item.id) : 0;
            return (
              <button
                key={item.id}
                type="button"
                className="wm-folder"
                title={item.label}
                aria-current={folder === item.id ? "true" : undefined}
                onClick={() => { setFolder(item.id); setOpenId(null); }}
              >
                <Icon name={item.id} />
                <span className="wm-label">{item.label}</span>
                {count > 0 ? <span className="wm-count">{count}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className={`wm-card${open ? " is-reading" : ""}`}>
          {username === undefined || (username && mailbox === null) ? <p className="wm-empty">Loading your inbox…</p> : null}
          {!username ? (
            <div className="wm-gate">
              <h1>Sign in to Westford Mail</h1>
              <p>Use the same Computer Steps username you use for the other practice websites.</p>
              <ScenarioSignIn onSignedIn={() => setMailbox(null)} />
            </div>
          ) : null}
          {username && mailbox === "missing" ? (
            <div className="wm-gate">
              <h1>We can&apos;t find that account</h1>
              <p>Open a Computer Steps account on Westford Bank, then come back here.</p>
              <button type="button" className="wm-btn wm-btn--main" onClick={() => clearLearner()}>Use a different username</button>
            </div>
          ) : null}
          {username && (mailbox === "error" || mailbox === null) && mailbox !== null ? (
            <div className="wm-gate">
              <h1>Westford Mail is not available</h1>
              <p>Check you are connected to the internet, then try again.</p>
              <button type="button" className="wm-btn wm-btn--main" onClick={() => void load(username)}>Try again</button>
            </div>
          ) : null}
          {mailbox && mailbox !== "missing" && mailbox !== "error" ? (
            <>
              <ul className="wm-list" aria-live="polite">
                {visible.length === 0 ? <li className="wm-empty" style={{ display: "block" }}>{query ? "No emails match your search." : "Nothing here yet."}</li> : null}
                {visible.map((message) => {
                  const who = message.folder === "drafts" ? "Draft" : message.folder === "sent" ? `To: ${message.toName || message.toAddress}` : message.fromName;
                  return (
                    <li key={message.id} className={message.read ? "" : "is-unread"}>
                      <button type="button" className={`wm-star${message.starred ? " is-on" : ""}`} aria-label={message.starred ? "Remove star" : "Add star"} onClick={() => void patch(message.id, { starred: !message.starred })}>
                        <Icon name="starred" />
                      </button>
                      <button type="button" className="wm-row" onClick={() => openMessage(message)}>
                        <span className="wm-who">{who}</span>
                        <span className="wm-mid">
                          <span className="wm-subj">{message.subject || "(no subject)"}</span>
                          <span className="wm-snip"> – {message.body.replace(/\s+/g, " ").slice(0, 80)}</span>
                        </span>
                        <time className="wm-when" dateTime={message.sentAt}>{message.attachments.length > 0 ? <Icon name="clip" /> : null}{when(message.sentAt)}</time>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {open ? (
                <article className="wm-reader" aria-live="polite">
                  <div className="wm-tools">
                    <button type="button" className="wm-btn" onClick={() => setOpenId(null)}>
                      <Icon name="back" /> Back to {FOLDERS.find((item) => item.id === folder)?.label}
                    </button>
                    {open.folder === "drafts" ? (
                      <button type="button" className="wm-btn wm-btn--main" onClick={() => startCompose({ title: "Draft", to: open.toAddress, subject: open.subject, body: open.body, draftId: open.id, attachments: open.attachments.map((file) => ({ name: file.name, size: "Practice file" })) })}>
                        Keep writing
                      </button>
                    ) : null}
                    {open.folder !== "drafts" && open.folder !== "sent" && open.folder !== "bin" ? (
                      <button
                        type="button"
                        className="wm-btn wm-btn--main"
                        onClick={() => startCompose({
                          title: "Reply",
                          to: open.fromAddress,
                          subject: open.subject.toLowerCase().startsWith("re:") ? open.subject : `Re: ${open.subject}`,
                          body: `\n\n— On ${when(open.sentAt)}, ${open.fromName} wrote:\n${open.body.split("\n").map((line) => `> ${line}`).join("\n")}`,
                          draftId: null,
                        })}
                      >
                        Reply
                      </button>
                    ) : null}
                    <button type="button" className="wm-btn" onClick={() => void patch(open.id, { starred: !open.starred })}>
                      {open.starred ? "Remove star" : "Add star"}
                    </button>
                    {open.folder === "bin" ? (
                      <button type="button" className="wm-btn" onClick={() => { void patch(open.id, { folder: open.mailbox === "sent" ? "sent" : "inbox" }); setOpenId(null); show("Put back."); }}>
                        Put back
                      </button>
                    ) : (
                      <button type="button" className="wm-btn" onClick={() => { void patch(open.id, { folder: "bin" }); setOpenId(null); show("Moved to Bin. You can get it back from the Bin folder."); }}>
                        <Icon name="bin" /> Delete
                      </button>
                    )}
                    {open.folder === "spam" ? (
                      <button type="button" className="wm-btn" onClick={() => { void patch(open.id, { folder: "inbox" }); setOpenId(null); show("Moved to Inbox."); }}>
                        This is not spam
                      </button>
                    ) : null}
                  </div>
                  <h1>{open.subject || "(no subject)"}</h1>
                  <div className="wm-meta">
                    <div className="wm-av" aria-hidden="true">{(open.folder === "sent" || open.folder === "drafts" ? open.toAddress || "?" : open.fromName).charAt(0).toUpperCase()}</div>
                    <div>
                      <b>{open.folder === "sent" || open.folder === "drafts" ? `To: ${open.toAddress || "nobody yet"}` : open.fromName}</b>
                      {open.folder === "sent" || open.folder === "drafts" ? null : <> &lt;{open.fromAddress}&gt;</>}
                      <small>{when(open.sentAt)}{open.eventRef ? ` · ${open.eventRef}` : ""}</small>
                    </div>
                  </div>
                  {open.attachments.length > 0 ? (
                    <div className="wm-attl">
                      {open.attachments.map((file) => (
                        <button key={file.name} type="button" className="wm-att" onClick={() => show(`${file.name} is a practice file. It stays inside Westford Mail and is not downloaded.`)}>
                          <Icon name="clip" /> {file.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="wm-body">{open.body}</div>
                  {open.note ? <div className="wm-tip"><b>Tip.</b> {open.note}</div> : null}
                </article>
              ) : null}
            </>
          ) : null}
        </div>
      </main>
      <form className={`wm-win${composing ? " is-open" : ""}`} role="dialog" aria-label="Write new email" onSubmit={onSend}>
        <div className="wm-wh">
          <span>{composeTitle}</span>
          <button type="button" aria-label="Close and save draft" onClick={() => void closeCompose(true)}>×</button>
        </div>
        <div className="wm-fld">
          <label htmlFor="wm-to">To</label>
          <input id="wm-to" value={to} autoComplete="off" onChange={(event) => setTo(event.target.value)} />
        </div>
        <div className="wm-chips">
          Practice contacts:{" "}
          {(mailbox && mailbox !== "missing" && mailbox !== "error" ? mailbox.organisations : []).filter((item) => item.id !== "mail").map((item) => (
            <button key={item.id} type="button" className="wm-chip" onClick={() => setTo(item.address)}>{item.name}</button>
          ))}
        </div>
        <div className="wm-fld">
          <label htmlFor="wm-subject">Subject</label>
          <input id="wm-subject" value={subject} autoComplete="off" onChange={(event) => setSubject(event.target.value)} />
        </div>
        <textarea id="wm-body" className="wm-msg" aria-label="Your message" placeholder="Type your message here" value={body} onChange={(event) => setBody(event.target.value)} />
        <div className="wm-attl" aria-live="polite">
          {attachments.map((file) => (
            <span key={file.name} className="wm-att">
              <Icon name="clip" /> {file.name} <small>{file.size}</small>
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item.name !== file.name))}>×</button>
            </span>
          ))}
        </div>
        <div className="wm-chips" style={{ borderTop: "1px solid var(--line)", borderBottom: 0 }}>
          Practice files:{" "}
          {PRACTICE_FILES.map((file) => (
            <button key={file.name} type="button" className="wm-chip" onClick={() => addAttachments([file])}>{file.name}</button>
          ))}
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(event) => {
            addAttachments(Array.from(event.target.files ?? []).map((file) => ({ name: file.name, size: fileSize(file.size) })));
            event.target.value = "";
          }}
        />
        {error ? <p className="wm-err" role="alert">{error}</p> : null}
        <div className="wm-wf">
          <button type="submit" className="wm-btn wm-btn--main" disabled={sending}>{sending ? "Sending…" : "Send"}</button>
          <button type="button" className="wm-btn" onClick={() => fileInput.current?.click()}>
            <Icon name="clip" /> Attach files
          </button>
          <button type="button" className="wm-btn" onClick={() => void closeCompose(false)}>Throw away</button>
        </div>
      </form>
      {toast ? <div className="wm-toast" role="status">{toast}</div> : null}
    </>
  );
}
