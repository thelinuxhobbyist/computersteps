import type { Metadata } from "next";
import Link from "next/link";
import HelpSearch from "./HelpSearch";
import { HELP_ARTICLES, HELP_GROUPS } from "./help-articles";
import { ENERGY_BASE } from "../energy-data";

export const metadata: Metadata = { title: "Help & Support" };

export default function HelpPage() {
  const articles = HELP_ARTICLES.map(({ slug, title, summary, keywords }) => ({ slug, title, summary, keywords }));

  return (
    <div className="we-wrap we-content">
      <h1>Help &amp; Support</h1>
      <p className="we-lead">Find answers about bills, payments, meters and more.</p>
      <HelpSearch articles={articles} />

      <div className="we-help-groups">
        {HELP_GROUPS.map((group) => (
          <section key={group} className="we-panel" aria-labelledby={`we-group-${group.toLowerCase().replace(/\W+/g, "-")}`}>
            <h2 id={`we-group-${group.toLowerCase().replace(/\W+/g, "-")}`}>{group}</h2>
            <ul className="we-help-list">
              {HELP_ARTICLES.filter((article) => article.group === group).map((article) => (
                <li key={article.slug}>
                  <Link href={`${ENERGY_BASE}/help/${article.slug}/`} className="we-link">
                    {article.title}
                  </Link>
                  <p className="we-small">{article.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="we-panel we-panel--tint">
        <h2>Can&rsquo;t find what you need?</h2>
        <p>
          <Link href={`${ENERGY_BASE}/contact/`} className="we-link">
            Contact us
          </Link>{" "}
          by phone, email, post or online message.
        </p>
      </div>
    </div>
  );
}
