"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { findVacancy } from "../../../workers/practice-bank/src/shared/job-catalogue";
import { PlaceLookup } from "./PlaceLookup";

export function JobsSearchBar() {
  const params = useSearchParams();
  const pathname = usePathname();
  const job = pathname.includes("/job") ? findVacancy(params.get("id") ?? "") : undefined;
  const title = job?.title ?? params.get("q") ?? "";
  const place = job ? job.town : (params.get("where") ?? "");
  return <SearchForm key={`${pathname}?${params.toString()}`} title={title} place={place} />;
}

function SearchForm({ title, place }: { title: string; place: string }) {
  const router = useRouter();
  const [q, setQ] = useState(title);
  const [where, setWhere] = useState(place);

  return (
    <div className="wj-searchbar">
      <form
        className="ps-wrap"
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams();
          if (q.trim()) next.set("q", q.trim());
          if (where.trim()) next.set("where", where.trim());
          const query = next.toString();
          router.push(query ? `/scenarios/jobs/search/?${query}` : "/scenarios/jobs/search/");
        }}
      >
        <input aria-label="Job title or keyword" placeholder="Job title or keyword" value={q} onChange={(event) => setQ(event.target.value)} />
        <PlaceLookup id="wj-search-where" label="Location" hideLabel placeholder="Town or postcode" value={where} onChange={setWhere} />
        <button type="submit">Search jobs</button>
      </form>
    </div>
  );
}
