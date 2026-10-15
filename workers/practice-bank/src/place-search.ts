import { json } from "./http";
import { dedupePlaces, placeFromPhoton, type PlaceResult } from "./shared/places";

const PHOTON = "https://photon.komoot.io/api/";

async function searchStreets(query: string): Promise<PlaceResult[]> {
  const response = await fetch(`${PHOTON}?q=${encodeURIComponent(query)}&limit=5&lang=en`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "WestfordJobs/1.0 (https://tutri.pages.dev/scenarios/jobs/)",
    },
  });
  if (!response.ok) return [];
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== "object") return [];
  const features = (body as { features?: unknown }).features;
  if (!Array.isArray(features)) return [];
  return features
    .map((feature) => (feature && typeof feature === "object" ? placeFromPhoton(feature as Record<string, unknown>) : null))
    .filter((item): item is PlaceResult => item !== null);
}

export async function searchAddresses(url: URL): Promise<Response> {
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (query.length < 2) return json({ results: [] });
  try {
    const results = dedupePlaces(await searchStreets(query));
    return json({ results });
  } catch {
    return json({ results: [] });
  }
}
