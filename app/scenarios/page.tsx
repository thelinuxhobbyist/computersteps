import type { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import ScenarioCard from "../components/ScenarioCard";
import SiteHeader from "../components/SiteHeader";
import { SCENARIOS } from "./scenarios";

export const metadata: Metadata = {
  title: "Scenarios | Computer Steps",
  description: "Practise everyday online tasks on safe, realistic pretend websites — shopping, contacting a GP surgery and more.",
};

export default function ScenariosPage() {
  return (
    <div className="site">
      <SiteHeader />

      <main className="wrap">
        <section className="hero" aria-labelledby="scenarios-heading">
          <h1 id="scenarios-heading">Scenarios</h1>
          <p className="hero-lead">
            Realistic pretend websites for practising everyday online tasks. Explore them, try things out and make mistakes —
            nothing you do here is real.
          </p>
        </section>

        <div className="safety-banner safety-banner--simulation" role="note">
          <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" className="safety-banner__icon" />
          <p>
            <strong>These are practice websites.</strong> Use the pretend details you are given. Never enter your real bank,
            medical or personal information.
          </p>
        </div>

        <section className="section" aria-labelledby="choose-scenario-heading">
          <div className="section-head">
            <h2 id="choose-scenario-heading">Choose a scenario</h2>
            <p>Each one works like a real website. Open &ldquo;Tasks to try&rdquo; for goals to work towards on your own.</p>
          </div>

          <div className="scenario-grid">
            {SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} showTutorTasks />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
