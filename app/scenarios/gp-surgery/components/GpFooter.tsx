import Link from "next/link";
import { GP_BASE, GP_NAV, SURGERY } from "../surgery-data";

export default function GpFooter() {
  return (
    <footer className="gp-footer">
      <div className="gp-wrap gp-footer__grid">
        <div>
          <h2>{SURGERY.name}</h2>
          <address>
            {SURGERY.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p>
            Telephone: <strong>{SURGERY.phone}</strong>
          </p>
          <p>
            Email: <strong>{SURGERY.email}</strong>
          </p>
        </div>

        <div>
          <h2>Opening hours</h2>
          <p>Monday to Friday: 8:00am to 6:30pm</p>
          <p>Saturday and Sunday: Closed</p>
          <p className="gp-footer__note">
            When we are closed, call <strong>111</strong>. In an emergency, call <strong>999</strong>.
          </p>
        </div>

        <div>
          <h2>Useful links</h2>
          <ul>
            {GP_NAV.filter((item) => item.href !== `${GP_BASE}/`).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="gp-footer__legal">
        <div className="gp-wrap">
          <p>© {SURGERY.name}. This is a fictional surgery created for practising digital skills with Computer Steps.</p>
        </div>
      </div>
    </footer>
  );
}
