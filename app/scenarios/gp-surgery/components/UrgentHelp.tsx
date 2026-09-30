import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function UrgentHelp({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`gp-urgent ${compact ? "gp-urgent--compact" : ""}`} aria-labelledby="gp-urgent-heading">
      <h2 id="gp-urgent-heading">
        <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Urgent help
      </h2>
      <div className="gp-urgent__grid">
        <p>
          <span className="gp-urgent__number">999</span>
          <span>
            <strong>Emergency.</strong> For example: chest pain, cannot breathe, signs of a stroke.
          </span>
        </p>
        <p>
          <span className="gp-urgent__number">111</span>
          <span>
            <strong>Need help fast, or we are closed.</strong> Not an emergency.
          </span>
        </p>
      </div>
    </aside>
  );
}
