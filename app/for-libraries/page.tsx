import type { Metadata } from "next";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "For Libraries & Tutors | ComputerSteps",
  description: "A note for librarians, digital-skills tutors and community organisations using ComputerSteps with their learners.",
};

export default function ForLibrariesPage() {
  return (
    <div className="site">
      <SiteHeader />

      <main className="wrap behind" id="content">
        <h1>Using ComputerSteps with your learners?</h1>
        <p>ComputerSteps was inspired by my experience volunteering at a community library, helping people develop their digital skills.</p>
        <p>If you&apos;re a librarian, digital-skills tutor or part of a community organisation using ComputerSteps to help people learn, I&apos;d love to hear from you.</p>
        <p>There&apos;s no fee, no obligation and no requirement to credit the project. I&apos;d simply be delighted to know that ComputerSteps is proving useful to others.</p>
        <p>
          <strong>Get in touch:</strong> <a href="mailto:hello@computersteps.com">hello@computersteps.com</a>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
