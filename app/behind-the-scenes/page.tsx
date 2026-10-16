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
        <h1>Behind the Scenes</h1>

        <h2>So, why another digital skills website?</h2>
        <p>Fair question. There are already plenty of websites explaining how to use computers. So why build ComputerSteps?</p>
        <p>As a volunteer digital-skills tutor at a community library, I&apos;ve encountered people who are genuinely afraid of clicking the wrong thing.</p>
        <p>If you&apos;ve used computers for years, clicking a button seems like second nature. But for someone who isn&apos;t confident, one click can feel like the beginning of a domino effect. A new page appears, something changes, and suddenly they don&apos;t know what happened or how to get back.</p>
        <p>And if you&apos;re trying to pay a bill, book an appointment or complete an important form, that fear is entirely understandable.</p>
        <p>Experienced computer users often take for granted the knowledge they&apos;ve built up over years. Beginners haven&apos;t had that opportunity to practise.</p>

        <h3>What if learning felt less frightening?</h3>
        <p>What if people could learn by doing, rather than simply reading instructions or watching someone demonstrate something?</p>
        <p>
          Imagine learning to double-click by popping balloons. Click one balloon, then another. Try again. Gradually, you understand the action through experience. When someone eventually calls it a <em>double-click</em>, the term makes sense because you already know what it feels like to do it.
        </p>
        <p>No complicated terminology to memorise. No important form to worry about. Just a safe place to experiment, make mistakes and try again.</p>
        <p>That&apos;s the thinking behind ComputerSteps.</p>

        <h3>From simple activities to real-life practice</h3>
        <p>ComputerSteps combines interactive learning activities with simulated websites and online services.</p>
        <p>The activities help people become familiar with individual skills. The scenarios give them somewhere to put those skills into practice, from navigating websites to using simulated banking services, booking travel or searching for a job.</p>
        <p>The aim isn&apos;t to make everyone a computer expert. It&apos;s to help people become more comfortable exploring and gradually develop the confidence to do more for themselves.</p>
        <p>Because sometimes, the most important thing someone can learn isn&apos;t which button to press. It&apos;s that they can press it without being afraid.</p>

        <h2>A little about how it was built</h2>
        <p>Behind the scenes, there&apos;s Cloudflare Workers, D1 and R2, and, of course, plenty of AI helping bring ideas to life.</p>

        <h2>Could it be better?</h2>
        <p>Absolutely. That&apos;s part of the point.</p>
        <p>ComputerSteps is an evolving project, and I&apos;d love to connect with developers, students and other curious tech people who might want to help improve it, fix things, build new scenarios or explore how it all works.</p>
        <p>If you share the idea that people learn best by doing, and that digital skills should feel less intimidating, perhaps you&apos;d like to help.</p>
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
