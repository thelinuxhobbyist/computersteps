import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Spot a suspicious advert" };

export default function SafetyPage() {
  return (
    <div className="ps-wrap wj-prose">
      <h1>Spot a suspicious advert</h1>
      <p className="wj-lead">
        Most job adverts are ordinary. A few are dishonest. These are the warning signs worth checking before you apply.
      </p>
      <h2>Reasons to pause</h2>
      <ul>
        <li>The advert asks you to pay a fee before you have a job, an interview or a written offer.</li>
        <li>The pay is unusually high for very little work, or for no experience at all.</li>
        <li>You are asked for bank details, a password, or copies of identity documents before anyone has interviewed you.</li>
        <li>The employer is unclear: no proper name, no address, and contact only by a private message.</li>
        <li>You are told to decide immediately, before you have time to read the advert or ask a question.</li>
      </ul>
      <h2>What one sign means</h2>
      <p>
        One warning sign is a reason to stop and check. It does not prove that every short advert, or every job that mentions training, is fraudulent. A genuine employer can offer training without charging you to start. A genuine advert can also be brief. Look at the whole advert, and compare it with a more ordinary one.
      </p>
      <p>
        Westford Jobs will not ask you to pay a fee, or to send bank details or copies of identity documents, in order to apply. If an advert asks for those things, treat it as a warning sign.
      </p>
      <p>
        <Link href="/scenarios/jobs/exercises/task/?id=spot-warning-signs">Warning signs in an advert</Link>
        {" · "}
        <Link href="/scenarios/jobs/exercises/task/?id=upfront-fee">Upfront fees</Link>
      </p>
    </div>
  );
}
