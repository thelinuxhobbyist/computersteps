import type { Metadata } from "next";
import ScenarioCard from "../components/ScenarioCard";
import SiteFooter from "../components/SiteFooter";
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
        <section className="hero hero--compact" aria-labelledby="scenarios-heading">
          <h1 id="scenarios-heading">Practise everyday tasks online</h1>
          <p className="hero-lead">Pretend websites for paying a bill, tracking a parcel, booking a trip or searching for a job. Nothing here is real.</p>
        </section>

        <div className="scenario-grid">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} showTutorTasks />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
