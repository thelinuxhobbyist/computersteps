"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearLearner, useLearner } from "../../lib/learner-session";

const LINKS = [
  ["Track", "/scenarios/deliveries/"],
  ["My deliveries", "/scenarios/deliveries/mine/"],
  ["Help", "/scenarios/deliveries/help/"],
] as const;

export default function DeliveryNav() {
  const path = usePathname();
  const router = useRouter();
  const username = useLearner();
  const current = path.endsWith("/") ? path : `${path}/`;
  return (
    <header className="ps-header">
      <div className="ps-wrap ps-header__row">
        <Link href="/scenarios/deliveries/" className="ps-logo">
          Westford Deliveries
        </Link>
        {username ? (
          <button
            type="button"
            className="ps-btn ps-btn--accent"
            onClick={() => {
              clearLearner();
              router.push("/scenarios/deliveries/");
            }}
          >
            Sign out
          </button>
        ) : (
          <Link className="ps-btn ps-btn--accent" href="/scenarios/deliveries/mine/">
            Sign in
          </Link>
        )}
      </div>
      <nav className="ps-nav" aria-label="Westford Deliveries">
        <div className="ps-wrap ps-nav">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
