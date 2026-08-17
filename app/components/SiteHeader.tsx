"use client";

import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faShoePrints, faXmark } from "@fortawesome/free-solid-svg-icons";

type SiteHeaderProps = {
  homeHref?: string;
};

export default function SiteHeader({ homeHref = "/" }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header>
      <div className="wrap header-inner">
        <Link href={homeHref} className="logo" aria-label="Go home" onClick={closeMenu}>
          <span className="logo-mark">
            <FontAwesomeIcon icon={faShoePrints} className="text-[0.8rem]" />
          </span>
          Computer<span className="accent">Steps</span>
        </Link>

        <nav className={`primary-nav ${mobileMenuOpen ? "open" : ""}`} aria-label="Main navigation">
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/courses/" onClick={closeMenu}>Courses</Link>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>
    </header>
  );
}
