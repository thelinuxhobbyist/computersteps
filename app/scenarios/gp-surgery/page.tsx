import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendarCheck,
  faCircleInfo,
  faClock,
  faLaptopMedical,
  faPills,
  faUserPlus,
  faUserDoctor,
} from "@fortawesome/free-solid-svg-icons";
import OpeningHoursTable from "./components/OpeningHoursTable";
import UrgentHelp from "./components/UrgentHelp";
import { GP_BASE, NEWS, SURGERY } from "./surgery-data";

const QUICK_LINKS = [
  { href: `${GP_BASE}/online-consultation/`, icon: faLaptopMedical, title: "Contact us online", body: "Ask for help with a medical or admin request." },
  { href: `${GP_BASE}/appointments/`, icon: faCalendarCheck, title: "Appointments", body: "How to book, change or cancel an appointment." },
  { href: `${GP_BASE}/prescriptions/`, icon: faPills, title: "Prescriptions", body: "Order a repeat prescription." },
  { href: `${GP_BASE}/contact/`, icon: faClock, title: "Opening hours and contact", body: "Our address, phone number and email." },
  { href: `${GP_BASE}/new-patients/`, icon: faUserPlus, title: "Register with us", body: "How to join the surgery as a new patient." },
  { href: `${GP_BASE}/our-team/`, icon: faUserDoctor, title: "Our team", body: "Meet our doctors, nurses and staff." },
];

export default function GpHomePage() {
  const latestNotice = NEWS[0];

  return (
    <>
      <section className="gp-hero">
        <div className="gp-wrap gp-hero__inner">
          <div>
            <h1>Welcome to {SURGERY.name}</h1>
            <p>
              We are a friendly GP surgery caring for around 9,000 patients in Millbrook and the surrounding villages. Contact
              us online at any time, or call us during opening hours.
            </p>
            <div className="gp-hero__actions">
              <Link href={`${GP_BASE}/online-consultation/`} className="gp-btn gp-btn--primary">
                Contact us online <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
              </Link>
              <Link href={`${GP_BASE}/appointments/`} className="gp-btn gp-btn--light">
                Appointments
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="gp-wrap">
        <div className="gp-notice" role="note">
          <FontAwesomeIcon icon={faCircleInfo} aria-hidden="true" className="gp-notice__icon" />
          <p>
            <strong>
              {latestNotice.title}: {latestNotice.date}.
            </strong>{" "}
            {latestNotice.body}
          </p>
        </div>

        <section className="gp-section" aria-labelledby="gp-how-heading">
          <h2 id="gp-how-heading" className="gp-section__title">
            How can we help?
          </h2>
          <ul className="gp-quick-links">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="gp-quick-link">
                  <FontAwesomeIcon icon={link.icon} aria-hidden="true" className="gp-quick-link__icon" />
                  <span>
                    <strong>{link.title}</strong>
                    <span>{link.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="gp-columns">
          <section className="gp-card" aria-labelledby="gp-home-hours-heading">
            <h2 id="gp-home-hours-heading">Opening hours</h2>
            <OpeningHoursTable caption="The surgery and phone lines are open at these times." />
            <p className="gp-card__foot">
              <Link href={`${GP_BASE}/contact/`}>Extended hours and when we are closed</Link>
            </p>
          </section>

          <section className="gp-card" aria-labelledby="gp-home-contact-heading">
            <h2 id="gp-home-contact-heading">Find us</h2>
            <address className="gp-address">
              {SURGERY.name}
              {SURGERY.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <dl className="gp-contact-list">
              <div>
                <dt>Telephone</dt>
                <dd>{SURGERY.phone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{SURGERY.email}</dd>
              </div>
            </dl>
            <p className="gp-card__foot">
              <Link href={`${GP_BASE}/contact/`}>All contact details</Link>
            </p>
          </section>
        </div>

        <UrgentHelp />

        <section className="gp-section" aria-labelledby="gp-news-heading">
          <h2 id="gp-news-heading" className="gp-section__title">
            Surgery news
          </h2>
          <ul className="gp-news">
            {NEWS.map((item) => (
              <li key={item.title} className="gp-news__item">
                <p className="gp-news__date">{item.date}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
