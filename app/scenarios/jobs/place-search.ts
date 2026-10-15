import { BANK_API_URL } from "../practice-bank/bank-api";
import { dedupePlaces, searchPostcodesIo, type PlaceResult } from "../../../workers/practice-bank/src/shared/places";

export type { PlaceResult };

async function searchStreets(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  try {
    const response = await fetch(`${BANK_API_URL}/places/search?q=${encodeURIComponent(query)}`, { signal, cache: "no-store" });
    if (!response.ok) return [];
    const body: unknown = await response.json().catch(() => null);
    if (!body || typeof body !== "object") return [];
    const results = (body as { results?: unknown }).results;
    if (!Array.isArray(results)) return [];
    return results.filter((item): item is PlaceResult => {
      if (!item || typeof item !== "object") return false;
      const row = item as PlaceResult;
      return typeof row.label === "string" && typeof row.search === "string";
    });
  } catch {
    return [];
  }
}

/** Real UK addresses from OpenStreetMap, plus towns and postcodes from postcodes.io. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const [streets, directory] = await Promise.all([searchStreets(query, signal), searchPostcodesIo(query, signal)]);
  return dedupePlaces([...streets, ...directory]);
}
