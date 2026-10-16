import type { Metadata } from "next";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Behind the Scenes | ComputerSteps",
  description: "Why ComputerSteps exists, how it was built, and how developers and other technical people can help.",
};

export default function BehindTheScenesPage() {
  return (
    <div className="site">
      <SiteHeader />

      <main className="wrap behind" id="content">
        <h1>So, why another digital skills website?</h1>
        <p>Fair question. There are already plenty of websites explaining how to use computers. So why build ComputerSteps?</p>
        <p>
          It started with volunteering at a community library, helping people develop their digital skills. I could see the value of learning by doing, rather than simply reading instructions or watching someone else demonstrate something.
        </p>
        <p>What if people could practise using online services in a safe environment, make mistakes without worrying about the consequences, and learn at their own pace?</p>
        <p>That was the idea behind ComputerSteps.</p>

        <h2>A little about how it was built</h2>
        <p>Behind the scenes, there&apos;s Cloudflare Workers, D1 and R2, and, of course, plenty of AI helping bring ideas to life.</p>

        <h2>Could it be better?</h2>
        <p>Absolutely. That&apos;s part of the point.</p>
        <p>
          ComputerSteps is an evolving project, and I&apos;d love to connect with developers, students and other curious tech people who might want to help improve it, fix things, build new scenarios or explore how it all works.
        </p>
        <p>Whether you&apos;re experienced or still learning yourself, if the project interests you, I&apos;d be happy to hear from you.</p>
        <p>
          <strong>Have a look around. If you think you could help make ComputerSteps better, let&apos;s talk.</strong>
        </p>
        <p>
          <strong>Get in touch:</strong> <a href="mailto:hello@computersteps.com">hello@computersteps.com</a>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
