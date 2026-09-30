import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { Scenario } from "../scenarios/scenarios";

type ScenarioCardProps = {
  scenario: Scenario;
  showTutorTasks?: boolean;
};

export default function ScenarioCard({ scenario, showTutorTasks = false }: ScenarioCardProps) {
  return (
    <article className="scenario-card">
      <div className="scenario-card__head">
        <span className="scenario-card__icon" aria-hidden="true">
          {scenario.icon}
        </span>
        <h3 className="scenario-card__title">{scenario.name}</h3>
      </div>

      <p className="scenario-card__description">{scenario.description}</p>

      <div className="scenario-card__skills" aria-label={`Skills practised in ${scenario.name}`}>
        {scenario.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      {showTutorTasks ? (
        <details className="scenario-card__tasks">
          <summary>Tasks to try</summary>
          <ul>
            {scenario.tutorTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <Link href={scenario.href} className="btn btn-primary scenario-card__link">
        Open {scenario.name} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Link>
    </article>
  );
}
