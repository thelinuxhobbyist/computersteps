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
          <h1 id="scenarios-heading">Practise everyday tasks online</h1>
          <p className="hero-lead">
            Build your confidence using realistic websites in a safe practice environment. From shopping online and managing a bank account to booking appointments and dealing with household services, ComputerSteps lets you practise everyday tasks at your own pace.
          </p>
        </section>

        <div className="safety-banner safety-banner--simulation" role="note">
          <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" className="safety-banner__icon" />
          <p>
            <strong>These are practice websites.</strong> Use the pretend details you are given. Nothing you do here is real, and no payment or service request is sent to a real organisation.
          </p>
        </div>

        <section className="section" aria-labelledby="choose-scenario-heading">
          <div className="section-head">
            <h2 id="choose-scenario-heading">Choose a scenario</h2>
            <p>Each one works like a realistic website. Follow the page, complete the task and build confidence step by step.</p>
          </div>

          <div className="scenario-grid">
            {SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} showTutorTasks />
            ))}
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="how-scenarios-work-heading">
          <div className="section-head">
            <h2 id="how-scenarios-work-heading">How scenarios work</h2>
          </div>
          <ol className="how-list">
            <li>
              <strong>Choose a fictional website</strong>
              <span>Pick a scenario that matches the task you want to practise.</span>
            </li>
            <li>
              <strong>Explore the pages</strong>
              <span>Browse around, read the information and look for the right place to act.</span>
            </li>
            <li>
              <strong>Complete a task</strong>
              <span>Fill in forms, check dates, submit requests and review what happened.</span>
            </li>
            <li>
              <strong>Get feedback</strong>
              <span>Learn from what worked and what you need to look for next time.</span>
            </li>
          </ol>
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
