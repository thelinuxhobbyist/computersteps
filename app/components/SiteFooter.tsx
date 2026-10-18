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
      <div className="wrap">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden="true">
            C
          </span>
          Computer<span className="accent">Steps</span>
        </Link>
        <p className="cs-footer__tagline">
          Free, friendly computer practice for anyone starting out. Take your time. Mistakes are welcome here, and nothing you try can break anything.
        </p>

        <nav className="cs-footer__nav" aria-label="Footer">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="cs-footer__end">
          <p className="cs-footer__patience">Made with patience, for learners everywhere.</p>
          <p className="cs-footer__legal">
            <span suppressHydrationWarning>© {new Date().getFullYear()} ComputerSteps</span>
            {hideDeveloperLink ? null : (
              <>
                {" "}
                <Link href="/behind-the-scenes/" className="cs-footer__dev">
                  Developer Info
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
