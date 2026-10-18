import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses/", label: "Courses" },
  { href: "/scenarios/", label: "Scenarios" },
  { href: "/for-libraries/", label: "For Libraries & Tutors" },
] as const;

export default function SiteFooter({ hideDeveloperLink = false }: { hideDeveloperLink?: boolean }) {
  return (
    <footer className="cs-footer">
      <div className="cs-footer__inner">
        <Link href="/" className="logo cs-footer__logo">
          <span className="logo-mark" aria-hidden="true">
            C
          </span>
          Computer<span className="accent">Steps</span>
        </Link>
        <p className="cs-footer__tagline">Free, friendly computer practice for anyone starting out.</p>
        <p className="cs-footer__tagline">Take your time. Mistakes are welcome here, and nothing you try can break anything.</p>

        <nav className="cs-footer__nav" aria-label="Footer">
          {LINKS.map((link, index) => (
            <span key={link.href} className="cs-footer__nav-item">
              {index > 0 ? (
                <span className="cs-footer__dot" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <Link href={link.href}>{link.label}</Link>
            </span>
          ))}
        </nav>

        <p className="cs-footer__patience">Made with patience, for learners everywhere.</p>
        <p className="cs-footer__legal">
          <span suppressHydrationWarning>© {new Date().getFullYear()} ComputerSteps</span>
          {hideDeveloperLink ? null : (
            <>
              <span className="cs-footer__dot" aria-hidden="true">
                ·
              </span>
              <Link href="/behind-the-scenes/" className="cs-footer__dev">
                Developer Info
              </Link>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
