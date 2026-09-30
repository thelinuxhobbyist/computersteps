import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function UrgentHelp({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`gp-urgent ${compact ? "gp-urgent--compact" : ""}`} aria-labelledby="gp-urgent-heading">
      <h2 id="gp-urgent-heading">
        <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Do you need urgent help?
      </h2>
      <p>
        Call <strong>999</strong> if someone is seriously ill or injured and their life is at risk, for example chest pain,
        difficulty breathing or signs of a stroke.
      </p>
      <p>
        If you need help urgently but it is not an emergency, or the surgery is closed, call <strong>111</strong>.
      </p>
    </aside>
  );
}
