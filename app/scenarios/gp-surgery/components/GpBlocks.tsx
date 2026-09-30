import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleInfo, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";

export function GpSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="gp-block">
      <h2 className="gp-block__title">{title}</h2>
      {children}
    </section>
  );
}

export function GpSteps({ steps }: { steps: { title: string; text?: ReactNode }[] }) {
  return (
    <ol className="gp-steps">
      {steps.map((step, index) => (
        <li key={step.title} className="gp-steps__item">
          <span className="gp-steps__num" aria-hidden="true">
            {index + 1}
          </span>
          <div>
            <p className="gp-steps__title">{step.title}</p>
            {step.text ? <p className="gp-steps__text">{step.text}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GpCards({ children }: { children: ReactNode }) {
  return <div className="gp-cards">{children}</div>;
}

export function GpCard({ icon, title, children }: { icon: IconDefinition; title: string; children: ReactNode }) {
  return (
    <div className="gp-info-card">
      <FontAwesomeIcon icon={icon} aria-hidden="true" className="gp-info-card__icon" />
      <h3>{title}</h3>
      <div className="gp-info-card__body">{children}</div>
    </div>
  );
}

export function GpDoDont({ yesTitle, yes, noTitle, no }: { yesTitle: string; yes: ReactNode[]; noTitle: string; no: ReactNode[] }) {
  return (
    <div className="gp-dodont">
      <div className="gp-dodont__col gp-dodont__col--yes">
        <h3>{yesTitle}</h3>
        <ul>
          {yes.map((item, index) => (
            <li key={index}>
              <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="gp-dodont__col gp-dodont__col--no">
        <h3>{noTitle}</h3>
        <ul>
          {no.map((item, index) => (
            <li key={index}>
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" /> <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EmailAddress({ email }: { email: string }) {
  const [user, domain] = email.split("@");
  return (
    <span className="gp-email-address">
      {user}@<wbr />
      {domain}
    </span>
  );
}

export function GpCallout({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  return (
    <div className={`gp-callout gp-callout--${tone}`}>
      <FontAwesomeIcon icon={tone === "warning" ? faTriangleExclamation : faCircleInfo} aria-hidden="true" className="gp-callout__icon" />
      <div>{children}</div>
    </div>
  );
}
