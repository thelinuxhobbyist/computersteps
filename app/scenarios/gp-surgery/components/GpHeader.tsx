"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";
import { GP_BASE, GP_NAV, SURGERY } from "../surgery-data";

export default function GpHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const isCurrent = (href: string) => {
    const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
    return href === `${GP_BASE}/` ? path === href : path.startsWith(href);
  };

  return (
    <header className="gp-header">
      <div className="gp-wrap gp-header__top">
        <Link href={`${GP_BASE}/`} className="gp-logo" onClick={() => setMenuOpen(false)}>
          <span className="gp-logo__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <path d="M12 4h8v8h8v8h-8v8h-8v-8H4v-8h8z" fill="currentColor" />
            </svg>
          </span>
          <span className="gp-logo__text">
            <span className="gp-logo__name">{SURGERY.name}</span>
            <span className="gp-logo__place">{SURGERY.addressLines[1]}</span>
          </span>
        </Link>

        <div className="gp-header__phone">
          <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
          <span>
            <span className="gp-header__phone-label">Call us</span>
            <strong>{SURGERY.phone}</strong>
          </span>
        </div>

        <button
          type="button"
          className="gp-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} aria-hidden="true" />
          Menu
        </button>
      </div>

      <nav id={menuId} className={`gp-nav ${menuOpen ? "is-open" : ""}`} aria-label="Surgery website">
        <ul className="gp-wrap gp-nav__list">
          {GP_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
