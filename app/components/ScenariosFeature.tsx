import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { SCENARIOS } from "../scenarios/scenarios";

export default function ScenariosFeature() {
  return (
    <div className="shop-feature">
      <div className="shop-feature__icon" aria-hidden="true">
        🧭
      </div>
      <div className="shop-feature__text">
        <p className="eyebrow">Practise real tasks</p>
        <h2>Scenarios</h2>
        <p>
          Try realistic pretend websites safely: {SCENARIOS.map((scenario) => scenario.name).join(", ")}. Nothing you do is
          real, so you can explore without worry.
        </p>
      </div>
      <Link href="/scenarios/" className="btn btn-primary">
        See the scenarios <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Link>
    </div>
  );
}
