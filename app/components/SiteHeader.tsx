"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faShoePrints, faXmark } from "@fortawesome/free-solid-svg-icons";

type SiteHeaderProps = {
  homeHref?: string;
};

export default function SiteHeader({ homeHref = "/" }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    document.body.classList.toggle("nav-open", mobileMenuOpen);
    return () => document.body.classList.remove("nav-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link href={homeHref} className="logo" aria-label="Go home" onClick={closeMenu}>
            <span className="logo-mark">
              <FontAwesomeIcon icon={faShoePrints} className="text-[0.8rem]" />
            </span>
            Computer<span className="accent">Steps</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/courses/">Courses</Link>
          </nav>

          <button
            type="button"
            className="nav-toggle"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls={menuId}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>
      </header>

      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <button type="button" className="mobile-nav__backdrop" aria-label="Close navigation menu" onClick={closeMenu} />
        <nav id={menuId} className="mobile-nav__panel" aria-label="Main navigation">
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/courses/" onClick={closeMenu}>Courses</Link>
        </nav>
      </div>
    </>
  );
}
