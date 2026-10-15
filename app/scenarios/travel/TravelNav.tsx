"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearLearner, useLearner } from "../../lib/learner-session";
import { WestfordMark } from "./TravelArt";

const LINKS = [
  ["Search", "/scenarios/travel/"],
  ["Flights", "/scenarios/travel/flights/"],
  ["Hotels", "/scenarios/travel/hotels/"],
  ["Holiday rentals", "/scenarios/travel/rentals/"],
  ["My trips", "/scenarios/travel/trips/"],
] as const;

export default function TravelNav() {
  const path = usePathname();
  const router = useRouter();
  const username = useLearner();
  const current = path.endsWith("/") ? path : `${path}/`;
  return (
    <header className="ps-header">
      <div className="ps-wrap ps-header__row">
        <Link href="/scenarios/travel/" className="wt-brand">
          <WestfordMark />
          Westford Travel
        </Link>
        {username ? (
          <button
            type="button"
            className="ps-btn ps-btn--ghost"
            onClick={() => {
              clearLearner();
              router.push("/scenarios/travel/");
            }}
          >
            Sign out
          </button>
        ) : (
          <Link className="ps-btn ps-btn--ghost" href="/scenarios/travel/trips/">
            Sign in
          </Link>
        )}
      </div>
      <nav className="ps-nav" aria-label="Westford Travel">
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
