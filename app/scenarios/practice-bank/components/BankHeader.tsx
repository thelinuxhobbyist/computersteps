"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBuildingColumns, faRightFromBracket, faXmark } from "@fortawesome/free-solid-svg-icons";
import { BANK_BASE, BANK_NAME, BANK_NAV } from "../bank-data";
import { logOut, useBankUsername } from "../bank-session";

export default function BankHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const username = useBankUsername();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;

  const handleLogOut = () => {
    setMenuOpen(false);
    logOut();
    router.push(`${BANK_BASE}/`);
  };

  return (
    <header className="pb-header">
      <div className="pb-wrap pb-header__top">
        <Link href={username ? `${BANK_BASE}/account/` : `${BANK_BASE}/`} className="pb-logo" onClick={() => setMenuOpen(false)}>
          <span className="pb-logo__mark" aria-hidden="true">
            <FontAwesomeIcon icon={faBuildingColumns} />
          </span>
          <span className="pb-logo__name">{BANK_NAME}</span>
        </Link>

        {username ? (
          <>
            <p className="pb-header__user">
              Logged in as <strong>{username}</strong>
            </p>
            <button
              type="button"
              className="pb-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} aria-hidden="true" />
              Menu
            </button>
          </>
        ) : null}
      </div>

      {username ? (
        <nav id={menuId} className={`pb-nav ${menuOpen ? "is-open" : ""}`} aria-label="Bank menu">
          <ul className="pb-wrap pb-nav__list">
            {BANK_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={path.startsWith(item.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pb-nav__logout">
              <button type="button" onClick={handleLogOut}>
                <FontAwesomeIcon icon={faRightFromBracket} aria-hidden="true" /> Log out
              </button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
