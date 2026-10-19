import test from "node:test";
import assert from "node:assert/strict";

import {
  MAIL_RETENTION_DAYS,
  checkOutgoing,
  foodsOrderMail,
  jobApplicationMail,
  learnerAddress,
  openedAccountMail,
  organisationReply,
  spamExamples,
  retentionCutoff,
  type ReplyContext,
} from "./shared/mail.ts";

const holder = { username: "yama4225", fullName: "Alex Morgan" };
const emptyContext: ReplyContext = {
  balancePence: 500000,
  transactions: [],
  application: null,
  councilReference: null,
  energyAccount: null,
  prescriptionReference: null,
  mobileNumber: null,
};

test("one username has one Westford Mail address", () => {
  assert.equal(learnerAddress("yama4225"), "yama4225@westfordmail.practice");
  assert.equal(learnerAddress("Yama4225"), "yama4225@westfordmail.practice");
});

test("opening an account writes a welcome and a bank confirmation with the same details", () => {
  const messages = openedAccountMail(holder, { sortCode: "04-00-12", accountNumber: "12345678", openedAt: "2026-10-19T09:00:00.000Z" });
  assert.equal(messages.length, 2);
  assert.equal(new Set(messages.map((message) => message.eventKey)).size, 2);
  assert.equal(messages[0].fromName, "Westford Mail Team");
  assert.equal(messages[0].fromAddress, "team@westfordmail.practice");
  assert.match(messages[1].body, /04-00-12/);
  assert.match(messages[1].body, /12345678/);
  assert.equal(messages[0].toAddress, "yama4225@westfordmail.practice");
  assert.doesNotMatch(messages[1].body, /security code \d/);
});

test("a shop payment keeps the order number and amount in the foods email", () => {
  const [order] = foodsOrderMail(holder, { reference: "PS1842", amountPence: 1250, paidAt: "2026-10-19T10:00:00.000Z" });
  assert.match(order.subject, /PS1842/);
  assert.match(order.body, /£12\.50/);
  assert.equal(order.eventRef, "PS1842");
});

test("a job application can confirm now and invite the learner later", () => {
  const messages = jobApplicationMail(holder, {
    reference: "WJ-2026-10482",
    title: "Warehouse operative",
    employer: "Northgate Stores",
    status: "interview",
    submittedAt: "2026-10-19T10:00:00.000Z",
    cvFileName: "ComputerSteps-sample-CV.txt",
    interview: { date: "2026-10-29", time: "10:30", location: "Northgate Stores, Leeds" },
  });
  assert.equal(messages[0].visibleAt, "2026-10-19T10:00:00.000Z");
  assert.ok(messages[0].attachments.some((file) => file.name.endsWith(".txt")));
  assert.ok(new Date(messages[1].visibleAt).getTime() > new Date(messages[0].visibleAt).getTime());
  assert.match(messages[1].body, /10:30/);
  assert.match(messages[1].body, /WJ-2026-10482/);
});

test("outgoing mail stays inside practice addresses", () => {
  const external = checkOutgoing({ to: "person@gmail.com", subject: "Hello there", body: "Please tell me about my account." });
  assert.equal(external.ok, false);
  const bank = checkOutgoing({ to: "help@westfordbank.practice", subject: "My payment", body: "Please tell me about my last payment." });
  assert.equal(bank.ok, true);
});

test("a bank reply uses the learner's own transactions", () => {
  const reply = organisationReply(
    "bank",
    holder,
    "My payment",
    "What was taken out of my account?",
    null,
    {
      ...emptyContext,
      transactions: [{ description: "Westford Foods", amountPence: -1250, postedAt: "2026-10-19T10:00:00.000Z", reference: "PS1842" }],
    },
  );
  assert.match(reply, /Westford Foods/);
  assert.match(reply, /PS1842/);
  assert.match(reply, /£12\.50/);
});

test("a new inbox includes example spam that is not from a practice address", () => {
  const spam = spamExamples(holder, "2026-10-19T09:00:00.000Z");
  assert.equal(spam.length, 3);
  assert.ok(spam.every((message) => message.folder === "spam"));
  assert.ok(spam.some((message) => /£5,000/.test(message.subject)));
  assert.ok(spam.every((message) => message.note.length > 20));
  assert.ok(spam.every((message) => !message.fromAddress.endsWith(".practice")));
});

test("messages are removed after two weeks, which is long enough to return to class", () => {
  assert.equal(MAIL_RETENTION_DAYS, 14);
  const cutoff = retentionCutoff(new Date("2026-10-19T00:00:00.000Z"));
  assert.equal(cutoff, "2026-10-05T00:00:00.000Z");
});
