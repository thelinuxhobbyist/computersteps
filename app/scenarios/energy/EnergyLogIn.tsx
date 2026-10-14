"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ScenarioSignIn } from "../../components/ScenarioSignIn";
import { ENERGY_BASE } from "./energy-data";
import { useEnergyUsername } from "./energy-session";

export default function EnergyLogIn() {
  const router = useRouter();
  const currentUser = useEnergyUsername();

  if (currentUser) {
    return (
      <div className="we-login">
        <h2>Welcome back</h2>
        <p>
          You are logged in as <strong>{currentUser}</strong>.
        </p>
        <Link href={`${ENERGY_BASE}/account/`} className="we-btn we-btn--primary">
          Go to my account <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="we-login">
      <ScenarioSignIn onSignedIn={() => router.push(`${ENERGY_BASE}/account/`)} />
    </div>
  );
}
