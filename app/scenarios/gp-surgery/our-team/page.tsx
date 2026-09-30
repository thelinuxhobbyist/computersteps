import type { Metadata } from "next";
import GpPageHeader from "../components/GpPageHeader";
import { TEAM } from "../surgery-data";

export const metadata: Metadata = { title: "Our team" };

function initials(name: string) {
  return name
    .replace(/^Dr\s+/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default function OurTeamPage() {
  return (
    <>
      <GpPageHeader title="Our team">
        <p>Meet the doctors, nurses and staff who work at the surgery.</p>
      </GpPageHeader>

      <div className="gp-wrap gp-content">
        {TEAM.map((group, index) => (
          <section key={group.heading} className="gp-section" aria-labelledby={`team-group-${index}`}>
            <h2 id={`team-group-${index}`} className="gp-section__title">
              {group.heading}
            </h2>
            <ul className="gp-team">
              {group.members.map((member) => (
                <li key={member.name} className="gp-team__member">
                  <span className="gp-team__avatar" aria-hidden="true">
                    {initials(member.name)}
                  </span>
                  <div>
                    <h3>{member.name}</h3>
                    <p className="gp-team__role">{member.role}</p>
                    <p>{member.details}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
