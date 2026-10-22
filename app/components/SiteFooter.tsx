import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses/", label: "Courses" },
  { href: "/scenarios/", label: "Scenarios" },
  { href: "/for-libraries/", label: "For Libraries & Tutors" },
] as const;

export default function SiteFooter({ hideDeveloperLink = false }: { hideDeveloperLink?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            ComputerSteps
          </Link>

          <p className="footer-description">
            Free, friendly computer practice for anyone starting out. Take your time. Mistakes are welcome here, and
            nothing you try can break anything.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="footer-tagline">Made with patience, for learners everywhere.</p>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          <span suppressHydrationWarning>© {new Date().getFullYear()} ComputerSteps</span>
        </p>

        {hideDeveloperLink ? null : (
          <div className="footer-developer">
            <Link href="/behind-the-scenes/">Developer Info</Link>
          </div>
        )}
      </div>
    </footer>
  );
}
