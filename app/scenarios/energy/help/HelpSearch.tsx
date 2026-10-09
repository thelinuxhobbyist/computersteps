"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ENERGY_BASE } from "../energy-data";

type SearchableArticle = { slug: string; title: string; summary: string; keywords: string[] };

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);

function score(article: SearchableArticle, query: string): number {
  const searchWords = words(query);
  if (searchWords.length === 0) return 0;
  const title = words(article.title);
  const summary = words(article.summary);
  const keywords = article.keywords.map((keyword) => keyword.toLowerCase().replace(/[’']/g, ""));
  const phrase = searchWords.join(" ");
  let total = keywords.some((keyword) => keyword === phrase || (phrase.length > 3 && keyword.includes(phrase))) ? 5 : 0;
  for (const word of searchWords) {
    const stem = word.length > 4 ? word.replace(/(ing|s)$/, "") : word;
    if (title.some((item) => item.startsWith(stem))) total += 3;
    if (keywords.some((keyword) => words(keyword).some((item) => item.startsWith(stem)))) total += 2;
    if (summary.some((item) => item.startsWith(stem))) total += 1;
  }
  return total;
}

export default function HelpSearch({ articles }: { articles: SearchableArticle[] }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearched(query.trim());
  };

  const results = searched
    ? articles
        .map((article) => ({ article, score: score(article, searched) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.article)
    : [];

  return (
    <div className="we-search">
      <form role="search" onSubmit={submit} className="we-search__form">
        <label htmlFor="we-help-search" className="we-label">
          Search for help
        </label>
        <div className="we-search__row">
          <input
            id="we-help-search"
            type="search"
            className="we-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="For example: pay my bill"
          />
          <button type="submit" className="we-btn we-btn--primary">
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" /> Search
          </button>
        </div>
      </form>

      {searched !== null ? (
        <div className="we-search__results" aria-live="polite">
          {searched === "" ? (
            <p>Type what you need help with, then choose Search.</p>
          ) : results.length === 0 ? (
            <p>
              No results for &ldquo;{searched}&rdquo;. Try different words, or look through the topics below.
            </p>
          ) : (
            <>
              <h2>
                {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{searched}&rdquo;
              </h2>
              <ul className="we-help-list">
                {results.map((article) => (
                  <li key={article.slug}>
                    <Link href={`${ENERGY_BASE}/help/${article.slug}/`} className="we-link">
                      {article.title}
                    </Link>
                    <p className="we-small">{article.summary}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
