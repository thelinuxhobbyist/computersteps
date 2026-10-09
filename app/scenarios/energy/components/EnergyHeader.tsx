"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBolt, faRightFromBracket, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ENERGY_BASE, ENERGY_NAV, WESTFORD } from "../energy-data";
import { logOut, useEnergyUsername } from "../energy-session";

export default function EnergyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const username = useEnergyUsername();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const isCurrent = (href: string) => (href === `${ENERGY_BASE}/` ? path === href : path.startsWith(href));

  const handleLogOut = () => {
    setMenuOpen(false);
    logOut();
    router.push(`${ENERGY_BASE}/`);
  };

  return (
    <header className="we-header">
      <div className="we-wrap we-header__top">
        <Link href={`${ENERGY_BASE}/`} className="we-logo" onClick={() => setMenuOpen(false)}>
          <span className="we-logo__mark" aria-hidden="true">
            <FontAwesomeIcon icon={faBolt} />
          </span>
          <span className="we-logo__name">{WESTFORD.name}</span>
        </Link>

        <div className="we-header__account">
          {username ? (
            <>
              <span>
                Logged in as <strong>{username}</strong>
              </span>
              <button type="button" className="we-header__logout" onClick={handleLogOut}>
                <FontAwesomeIcon icon={faRightFromBracket} aria-hidden="true" /> Log out
              </button>
            </>
          ) : (
            <Link href={`${ENERGY_BASE}/`} className="we-header__login">
              Log in
            </Link>
          )}
        </div>

        <button
          type="button"
          className="we-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} aria-hidden="true" />
          Menu
        </button>
      </div>

      <nav id={menuId} className={`we-nav ${menuOpen ? "is-open" : ""}`} aria-label={WESTFORD.name}>
        <ul className="we-wrap we-nav__list">
          {ENERGY_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
