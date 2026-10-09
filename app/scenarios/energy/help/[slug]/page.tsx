import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { HELP_ARTICLES, getHelpArticle } from "../help-articles";
import { ENERGY_BASE, WESTFORD } from "../../energy-data";

type HelpArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return HELP_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: HelpArticlePageProps): Promise<Metadata> {
  const article = getHelpArticle((await params).slug);
  return { title: article ? article.title : "Help" };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const article = getHelpArticle((await params).slug);
  if (!article) notFound();
  const related = HELP_ARTICLES.filter((other) => other.group === article.group && other.slug !== article.slug);

  return (
    <div className="we-wrap we-content we-article-layout">
      <article className="we-article">
        <Link href={`${ENERGY_BASE}/help/`} className="we-back">
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" /> Help &amp; Support
        </Link>
        <p className="we-eyebrow">{article.group}</p>
        <h1>{article.title}</h1>
        {article.body()}
      </article>
      <aside className="we-aside">
        {related.length > 0 ? (
          <nav className="we-panel" aria-labelledby="we-related-heading">
            <h2 id="we-related-heading">Related help</h2>
            <ul className="we-list">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link href={`${ENERGY_BASE}/help/${other.slug}/`} className="we-link">
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div className="we-panel">
          <h2>Still need help?</h2>
          <p>
            <Link href={`${ENERGY_BASE}/contact/`} className="we-link">
              Contact {WESTFORD.name}
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
