"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBars, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SCENARIOS } from "../scenarios/scenarios";

type SiteHeaderProps = {
  homeHref?: string;
};

export default function SiteHeader({ homeHref = "/" }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const menuId = useId();
  const scenariosMenuId = useId();
  const scenariosRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMobileMenuOpen(false);
  const closeScenarios = () => setScenariosOpen(false);

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

  useEffect(() => {
    if (!scenariosOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!scenariosRef.current?.contains(event.target as Node)) closeScenarios();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeScenarios();
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [scenariosOpen]);

  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link href={homeHref} className="logo" aria-label="Go home" onClick={closeMenu}>
            <span className="logo-mark" aria-hidden="true">
              C
            </span>
            Computer<span className="accent">Steps</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/courses/">Courses</Link>
            <div className="nav-dropdown" ref={scenariosRef}>
              <button
                type="button"
                className="nav-dropdown__toggle"
                aria-expanded={scenariosOpen}
                aria-controls={scenariosMenuId}
                onClick={() => setScenariosOpen((value) => !value)}
              >
                Scenarios <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" className="nav-dropdown__chevron" />
              </button>
              <div id={scenariosMenuId} className="nav-dropdown__menu" hidden={!scenariosOpen}>
                {SCENARIOS.map((scenario) => (
                  <Link key={scenario.id} href={scenario.href} className="nav-dropdown__item" onClick={closeScenarios}>
                    <span className="nav-dropdown__icon" aria-hidden="true">
                      {scenario.icon}
                    </span>
                    <span className="nav-dropdown__text">
                      <strong>{scenario.name}</strong>
                      <span>{scenario.summary}</span>
                    </span>
                  </Link>
                ))}
                <Link href="/scenarios/" className="nav-dropdown__all" onClick={closeScenarios}>
                  All scenarios <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </Link>
              </div>
            </div>
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
          <Link href="/scenarios/" onClick={closeMenu}>Scenarios</Link>
          {SCENARIOS.map((scenario) => (
            <Link key={scenario.id} href={scenario.href} className="mobile-nav__sublink" onClick={closeMenu}>
              <span aria-hidden="true">{scenario.icon}</span> {scenario.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
