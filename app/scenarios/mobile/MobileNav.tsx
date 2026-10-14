"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearLearner, useLearner } from "../../lib/learner-session";

const LINKS = [
  ["Home", "/scenarios/mobile/"],
  ["My Account", "/scenarios/mobile/account/"],
  ["My Usage", "/scenarios/mobile/usage/"],
  ["My Bill", "/scenarios/mobile/bill/"],
  ["My Plan", "/scenarios/mobile/plan/"],
  ["Payments", "/scenarios/mobile/payments/"],
  ["Help", "/scenarios/mobile/help/"],
  ["Contact", "/scenarios/mobile/contact/"],
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const username = useLearner();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <header className="ps-header">
      <div className="ps-wrap ps-header__row">
        <Link href="/scenarios/mobile/" className="ps-logo">
          Westford Mobile
        </Link>
        {username ? (
          <button
            type="button"
            className="ps-btn ps-btn--ghost"
            onClick={() => {
              clearLearner();
              router.push("/scenarios/mobile/");
            }}
          >
            Sign out
          </button>
        ) : (
          <Link href="/scenarios/mobile/account/" className="ps-btn ps-btn--ghost">
            Sign in
          </Link>
        )}
      </div>
      <nav className="ps-nav" aria-label="Westford Mobile">
        <div className="ps-wrap ps-nav">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
