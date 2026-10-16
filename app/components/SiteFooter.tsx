import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="cs-footer">
      <div className="cs-footer__inner">
        <div className="cs-footer__top">
          <div className="cs-footer__brand">
            <Link href="/" className="logo cs-footer__logo">
              <span className="logo-mark" aria-hidden="true">
                C
              </span>
              Computer<span className="accent">Steps</span>
            </Link>
            <p className="cs-footer__tagline">
              Free, friendly computer practice for anyone starting out. Take your time. Mistakes are welcome here, and nothing you try can break anything.
            </p>
          </div>

          <nav className="cs-footer__nav" aria-label="Footer">
            <Link href="/">Home</Link>
            <Link href="/courses/">Courses</Link>
            <Link href="/scenarios/">Scenarios</Link>
          </nav>
        </div>

        <div className="cs-footer__bottom">
          <span>Made with patience, for learners everywhere.</span>
          <span suppressHydrationWarning>© {new Date().getFullYear()} ComputerSteps</span>
          <span className="cs-footer__dev">
            Are you a developer? <Link href="/behind-the-scenes/">Behind the Scenes</Link>
            {" · "}
            <Link href="/for-libraries/">For Libraries & Tutors</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
