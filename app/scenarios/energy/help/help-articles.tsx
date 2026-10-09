import Link from "next/link";
import type { ReactNode } from "react";
import { ENERGY_BASE, SUPPORT_HOURS, WESTFORD } from "../energy-data";

export type HelpGroup = "Bills and payments" | "Meters and usage" | "Money worries" | "Your home" | "Staying safe";

export const HELP_GROUPS: HelpGroup[] = ["Bills and payments", "Money worries", "Meters and usage", "Your home", "Staying safe"];

export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  group: HelpGroup;
  /** Extra words people might search for. */
  keywords: string[];
  body: () => ReactNode;
};

const help = (slug: string) => `${ENERGY_BASE}/help/${slug}/`;

function Hours({ rows }: { rows: readonly { day: string; hours: string }[] }) {
  return (
    <table className="we-table we-table--compact">
      <tbody>
        {rows.map((row) => (
          <tr key={row.day}>
            <th scope="row">{row.day}</th>
            <td>{row.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "ways-to-pay",
    title: "Ways to pay your bill",
    summary: "Pay online, by Direct Debit, by phone or by bank transfer.",
    group: "Bills and payments",
    keywords: ["pay", "payment", "card", "phone", "bank transfer", "sort code", "reference", "direct debit", "cash", "cheque"],
    body: () => (
      <>
        <p>There are four ways to pay your Westford Energy bill.</p>

        <h2>1. Online with a debit card</h2>
        <p>
          Log in to your account and go to <Link href={`${ENERGY_BASE}/payments/pay/`} className="we-link">Pay online</Link>. You can pay the full amount or part of it. The payment
          is taken straight away.
        </p>

        <h2>2. Direct Debit</h2>
        <p>
          The money is taken from your bank account automatically each month, so you never have to remember to pay. You choose the day.{" "}
          <Link href={help("direct-debit")} className="we-link">Find out about Direct Debit</Link>.
        </p>

        <h2>3. By phone</h2>
        <p>
          Call our automated payment line on <strong>{WESTFORD.payLine}</strong>. It is open <strong>24 hours a day, 7 days a week</strong>. You will need your account
          number and your debit card.
        </p>

        <h2>4. Bank transfer</h2>
        <p>Send the money from your bank to ours using these details:</p>
        <dl className="we-details we-panel">
          <div>
            <dt>Name</dt>
            <dd>{WESTFORD.bankDetails.payeeName}</dd>
          </div>
          <div>
            <dt>Sort code</dt>
            <dd>{WESTFORD.bankDetails.sortCode}</dd>
          </div>
          <div>
            <dt>Account number</dt>
            <dd>{WESTFORD.bankDetails.accountNumber}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>Your Westford Energy account number (it starts with WE)</dd>
          </div>
        </dl>
        <p>
          It is important to use your account number as the reference. Without it, we can&rsquo;t tell who the money is from. You can find your account number on your bill
          and on <Link href={`${ENERGY_BASE}/account/`} className="we-link">My Account</Link>.
        </p>

        <h2>Cash and cheques</h2>
        <p>We don&rsquo;t accept cash or cheques.</p>
      </>
    ),
  },
  {
    slug: "direct-debit",
    title: "Paying by Direct Debit",
    summary: "Pay automatically each month, on a day that suits you.",
    group: "Bills and payments",
    keywords: ["direct debit", "automatic", "every month", "day", "date", "cancel", "change"],
    body: () => (
      <>
        <p>A Direct Debit lets us take the amount of your bill from your bank account automatically each month.</p>
        <h2>Why pay by Direct Debit?</h2>
        <ul>
          <li>Your bill is always paid on time, without you having to remember.</li>
          <li>You can see each payment in your bank account.</li>
          <li>You are protected by the Direct Debit Guarantee. If a payment is taken by mistake, your bank will give it back straight away.</li>
        </ul>
        <h2>Choosing your payment day</h2>
        <p>
          You can choose any day from the <strong>1st to the 28th</strong> of the month. Many people choose the day after they are paid.
        </p>
        <h2>What you need</h2>
        <ul>
          <li>the name on your bank account</li>
          <li>your bank sort code (6 numbers)</li>
          <li>your bank account number (8 numbers)</li>
        </ul>
        <p>
          <Link href={`${ENERGY_BASE}/payments/direct-debit/`} className="we-btn we-btn--primary">
            Set up or manage your Direct Debit
          </Link>
        </p>
        <h2>Cancelling</h2>
        <p>You can cancel your Direct Debit at any time from the same page. If you cancel, you will need to pay each bill yourself.</p>
      </>
    ),
  },
  {
    slug: "understanding-your-bill",
    title: "Understanding your bill",
    summary: "What the standing charge, unit rate and meter readings on your bill mean.",
    group: "Bills and payments",
    keywords: ["bill", "standing charge", "unit rate", "kwh", "units", "estimate", "estimated", "actual", "vat", "period", "reference"],
    body: () => (
      <>
        <p>Your bill is made up of two charges.</p>
        <h2>Electricity used</h2>
        <p>
          Electricity is measured in <strong>kilowatt hours (kWh)</strong>, sometimes called units. We work out how many kWh you used from your meter readings, then multiply
          by your <strong>unit rate</strong> (the price for each kWh).
        </p>
        <h2>Standing charge</h2>
        <p>
          The standing charge is a fixed amount for each day, even if you don&rsquo;t use any electricity. It pays for keeping your home connected to the network.
        </p>
        <h2>Actual and estimated readings</h2>
        <p>
          An <strong>actual</strong> reading is a real reading of your meter. If we don&rsquo;t have one, we <strong>estimate</strong> it based on what you used before. An
          estimated bill may be too high or too low.
        </p>
        <p>
          To make sure your bills are right, <Link href={`${ENERGY_BASE}/usage/meter-reading/`} className="we-link">send us a meter reading</Link>.
        </p>
        <h2>VAT</h2>
        <p>All our prices include VAT at 5%.</p>
        <h2>When to pay</h2>
        <p>Please pay each bill within {WESTFORD.billDueDays} days. The &ldquo;pay by&rdquo; date is on the front of your bill.</p>
      </>
    ),
  },
  {
    slug: "higher-bill",
    title: "Why is my bill higher than usual?",
    summary: "Common reasons a bill goes up, and what to check.",
    group: "Bills and payments",
    keywords: ["high", "higher", "expensive", "more", "increase", "went up", "wrong bill"],
    body: () => (
      <>
        <p>If your bill is higher than you expected, check these things:</p>
        <ul>
          <li>
            <strong>Did you use more electricity?</strong> We use more in colder, darker months for heating and lighting. Compare the kWh on your bills on the{" "}
            <Link href={`${ENERGY_BASE}/usage/`} className="we-link">Energy Usage</Link> page.
          </li>
          <li>
            <strong>Was the bill estimated?</strong> If so, it might not match what you really used. <Link href={`${ENERGY_BASE}/usage/meter-reading/`} className="we-link">Send us a reading</Link>.
          </li>
          <li>
            <strong>Is it a longer bill?</strong> A bill for 31 days costs more than one for 30 days.
          </li>
          <li>
            <strong>Did the price change?</strong> Compare the unit rate and standing charge with an older bill.
          </li>
        </ul>
        <p>
          If you still think the bill is wrong, <Link href={`${ENERGY_BASE}/contact/`} className="we-link">contact us</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "late-payment",
    title: "If you pay late",
    summary: "What happens if you miss the pay by date.",
    group: "Bills and payments",
    keywords: ["late", "fee", "charge", "missed", "overdue", "reminder", "penalty"],
    body: () => (
      <>
        <p>
          <strong>We don&rsquo;t charge a fee for paying late.</strong>
        </p>
        <p>If a bill is not paid by the pay by date, we will send you a reminder. Please pay as soon as you can.</p>
        <p>
          If you are finding it hard to pay, please tell us as early as possible. <Link href={help("struggling-to-pay")} className="we-link">See the help we offer</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "payment-problems",
    title: "Problems making a payment",
    summary: "What to do if a payment doesn't go through.",
    group: "Bills and payments",
    keywords: ["problem", "declined", "failed", "didn't work", "error", "card", "not working", "payment"],
    body: () => (
      <>
        <p>If your online payment didn&rsquo;t go through, check these things:</p>
        <ul>
          <li>Type the card number, expiry date and security code exactly as they are on the card.</li>
          <li>Type the name exactly as it is on the card.</li>
          <li>Make sure there is enough money in your bank account. If there isn&rsquo;t, your bank will decline the payment.</li>
          <li>Check you are connected to the internet.</li>
        </ul>
        <p>
          You can also pay by phone on <strong>{WESTFORD.payLine}</strong>, at any time of day. See <Link href={help("ways-to-pay")} className="we-link">all the ways to pay</Link>.
        </p>
        <p>If a payment has left your bank account but doesn&rsquo;t show on your Westford Energy account after 2 working days, please contact us.</p>
      </>
    ),
  },
  {
    slug: "struggling-to-pay",
    title: "If you're struggling to pay",
    summary: "Payment plans, grants and payment breaks. Talk to us early.",
    group: "Money worries",
    keywords: ["can't pay", "cannot pay", "afford", "money worries", "debt", "struggling", "hardship", "grant", "payment plan", "break", "help paying", "extra help"],
    body: () => (
      <>
        <p>If you are worried about paying your bill, please talk to us as soon as you can. We will not judge you, and we can help.</p>
        <h2>Help we can offer</h2>
        <ul>
          <li>
            <strong>A payment plan</strong>: pay what you owe in smaller amounts, over a longer time.
          </li>
          <li>
            <strong>The Westford Support Fund</strong>: a grant that pays off some or all of what you owe. You don&rsquo;t pay it back.
          </li>
          <li>
            <strong>A payment break</strong>: stop paying for up to 3 months while you get back on track.
          </li>
        </ul>
        <h2>Talk to our Support Team</h2>
        <p>
          Our Support Team helps customers who are struggling to pay. Call free on <strong>{WESTFORD.supportPhone}</strong>.
        </p>
        <Hours rows={SUPPORT_HOURS} />
        <p>
          If you would rather write, <Link href={`${ENERGY_BASE}/contact/`} className="we-link">send us a message</Link> and choose &ldquo;I&rsquo;m finding it hard to
          pay&rdquo;.
        </p>
        <h2>Free, independent advice</h2>
        <p>Debt advice charities, like Citizens Advice, can give you free advice about money and bills.</p>
      </>
    ),
  },
  {
    slug: "meter-readings",
    title: "Sending a meter reading",
    summary: "How to read your meter and send us a reading.",
    group: "Meters and usage",
    keywords: ["meter", "reading", "read", "estimate", "numbers", "serial"],
    body: () => (
      <>
        <p>Sending us a reading means your bill is based on what you really used, not an estimate.</p>
        <h2>How to read your meter</h2>
        <ol>
          <li>Find your electricity meter. It is often in a cupboard, under the stairs or in a box outside.</li>
          <li>Check the serial number on the meter matches the one on your bill.</li>
          <li>Write down the numbers from left to right. Leave out any numbers in red or after a decimal point.</li>
        </ol>
        <p>
          <Link href={`${ENERGY_BASE}/usage/meter-reading/`} className="we-btn we-btn--primary">
            Send a meter reading
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "saving-energy",
    title: "Ways to use less energy",
    summary: "Simple ways to bring your bills down.",
    group: "Meters and usage",
    keywords: ["save", "saving", "reduce", "cheaper", "lower", "tips", "use less"],
    body: () => (
      <>
        <ul>
          <li>Switch off lights when you leave a room.</li>
          <li>Turn appliances off at the wall instead of leaving them on standby.</li>
          <li>Only boil as much water as you need.</li>
          <li>Wash clothes at 30 degrees.</li>
          <li>Close curtains at dusk to keep the heat in.</li>
        </ul>
        <p>
          You can see how much electricity you use each month on the <Link href={`${ENERGY_BASE}/usage/`} className="we-link">Energy Usage</Link> page.
        </p>
      </>
    ),
  },
  {
    slug: "moving-home",
    title: "Moving home",
    summary: "What to tell us when you move.",
    group: "Your home",
    keywords: ["move", "moving", "house", "new address", "leaving"],
    body: () => (
      <>
        <p>
          Please tell us at least <strong>2 days before you move</strong>. We need:
        </p>
        <ul>
          <li>the date you are moving</li>
          <li>your new address, so we can send your final bill</li>
          <li>a meter reading on the day you move</li>
        </ul>
        <p>
          You can <Link href={`${ENERGY_BASE}/contact/`} className="we-link">send us a message</Link> and choose &ldquo;Moving home&rdquo;, or call us on {WESTFORD.phone}.
        </p>
        <p>Your account won&rsquo;t close by itself. Until you tell us, you will still be billed for the energy used at the old address.</p>
      </>
    ),
  },
  {
    slug: "power-cut",
    title: "Power cuts and emergencies",
    summary: "Who to call if your power goes off or you smell gas.",
    group: "Your home",
    keywords: ["power cut", "no power", "lights off", "emergency", "electricity off", "gas", "smell gas", "105"],
    body: () => (
      <>
        <div className="we-callout we-callout--urgent">
          <p>
            <strong>Power cut?</strong> Call <strong>{WESTFORD.powerCutNumber}</strong>. It&rsquo;s free, and open day and night.
          </p>
        </div>
        <p>
          Power cuts are dealt with by your local network operator, not by Westford Energy. Calling {WESTFORD.powerCutNumber} puts you through to them, wherever you live.
        </p>
        <h2>Before you call</h2>
        <ul>
          <li>Check whether your neighbours have power too.</li>
          <li>If only your home is affected, check your fuse box. A switch may have tripped.</li>
        </ul>
        <h2>If you smell gas</h2>
        <p>
          Call the National Gas Emergency Service straight away on <strong>{WESTFORD.gasEmergencyNumber}</strong>. Open windows and don&rsquo;t use light switches.
        </p>
        <p>
          If someone in your home relies on electricity for medical equipment, join the <Link href={help("priority-services")} className="we-link">Priority Services Register</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "priority-services",
    title: "Priority Services Register",
    summary: "Free extra help for people who need it.",
    group: "Your home",
    keywords: ["priority", "psr", "extra help", "medical", "equipment", "disabled", "disability", "elderly", "older", "vulnerable", "large print"],
    body: () => (
      <>
        <p>
          The <strong>Priority Services Register</strong> is a free service for people who need extra help, for example:
        </p>
        <ul>
          <li>people who use medical equipment that needs electricity</li>
          <li>older people</li>
          <li>people with a disability or long-term illness</li>
          <li>people with young children</li>
        </ul>
        <h2>What you get</h2>
        <ul>
          <li>Advance warning of planned power cuts.</li>
          <li>Priority support during a power cut.</li>
          <li>Bills in large print or braille.</li>
          <li>A password scheme, so you know a caller really is from us.</li>
        </ul>
        <p>
          To join, call us on {WESTFORD.phone} or <Link href={`${ENERGY_BASE}/contact/`} className="we-link">send us a message</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "scams",
    title: "Scam emails, texts and calls",
    summary: "How to spot a scam, and what to do.",
    group: "Staying safe",
    keywords: ["scam", "fraud", "phishing", "suspicious", "email", "text", "refund", "fake", "safe"],
    body: () => (
      <>
        <p>Criminals sometimes pretend to be energy companies. They may offer a refund or say you owe money.</p>
        <h2>Westford Energy will never:</h2>
        <ul>
          <li>ask for your password</li>
          <li>ask for your full card details or PIN by email or text</li>
          <li>send you a link asking you to claim a refund</li>
        </ul>
        <h2>If you get a suspicious email</h2>
        <ul>
          <li>Don&rsquo;t click any links or open attachments.</li>
          <li>Don&rsquo;t reply.</li>
          <li>
            Forward it to <strong>{WESTFORD.scamReportEmail}</strong>, then delete it.
          </li>
        </ul>
        <p>For a suspicious text, forward it to 7726 (free).</p>
        <p>If you are not sure whether something is really from us, log in to your account by typing our web address yourself, or call us.</p>
      </>
    ),
  },
  {
    slug: "online-account",
    title: "Using your online account",
    summary: "What you can do when you log in.",
    group: "Bills and payments",
    keywords: ["log in", "login", "account", "online", "username", "sign in"],
    body: () => (
      <>
        <p>With your online account you can:</p>
        <ul>
          <li>see your latest bill and older bills</li>
          <li>pay a bill</li>
          <li>set up a Direct Debit</li>
          <li>send a meter reading</li>
          <li>see how much electricity you use</li>
          <li>send us a message</li>
        </ul>
        <p>
          Log in on the <Link href={`${ENERGY_BASE}/`} className="we-link">home page</Link>.
        </p>
      </>
    ),
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}