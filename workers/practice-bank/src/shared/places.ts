export type PlaceResult = {
  id: string;
  label: string;
  addressLine: string;
  town: string;
  postcode: string;
  search: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function placeFromPostcode(raw: Record<string, unknown>): PlaceResult | null {
  const postcode = text(raw.postcode).toUpperCase();
  if (!postcode) return null;
  const town = text(raw.admin_district) || text(raw.parish).replace(/, unparished area$/i, "") || text(raw.admin_ward);
  const region = text(raw.region);
  return {
    id: `pc:${postcode}`,
    label: [postcode, town, region].filter(Boolean).join(", "),
    addressLine: "",
    town: town || postcode,
    postcode,
    search: town || postcode,
  };
}

export function placeFromGazetteer(raw: Record<string, unknown>): PlaceResult | null {
  const name = text(raw.name_1);
  if (name.length < 2) return null;
  const district = text(raw.district_borough) || text(raw.county_unitary);
  return {
    id: `pl:${text(raw.code) || name}`,
    label: [name, district].filter(Boolean).join(", "),
    addressLine: "",
    town: name,
    postcode: "",
    search: name,
  };
}

export function placeFromPhoton(raw: Record<string, unknown>): PlaceResult | null {
  const props = record(raw.properties);
  if (!props) return null;
  const country = text(props.countrycode).toUpperCase();
  if (country && country !== "GB") return null;
  const number = text(props.housenumber);
  const street = text(props.street);
  const name = text(props.name);
  const town = text(props.city) || text(props.locality) || text(props.district) || text(props.county);
  const postcode = text(props.postcode).toUpperCase();
  const addressLine = [number, street].filter(Boolean).join(" ") || name;
  if (!addressLine && !town && !postcode) return null;
  const label = [addressLine, town, postcode].filter(Boolean).join(", ");
  return {
    id: `ad:${text(props.osm_id) || label}`,
    label,
    addressLine,
    town: town || postcode,
    postcode,
    search: town || postcode || addressLine,
  };
}

export function dedupePlaces(items: PlaceResult[]): PlaceResult[] {
  const seen = new Set<string>();
  const out: PlaceResult[] = [];
  for (const item of items) {
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.slice(0, 8);
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  if (!response.ok) return null;
  const body: unknown = await response.json().catch(() => null);
  return record(body);
}

async function loadGazetteer(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const response = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(query)}&limit=5`, { signal });
  const body = await readJson(response);
  const rows = Array.isArray(body?.result) ? body.result : [];
  return rows.map((row) => (record(row) ? placeFromGazetteer(record(row)!) : null)).filter((item): item is PlaceResult => item !== null);
}

async function loadPostcodes(compact: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}/autocomplete?limit=5`, { signal });
  const body = await readJson(response);
  const codes = Array.isArray(body?.result) ? body.result.filter((item): item is string => typeof item === "string") : [];
  if (!codes.length) return [];
  const bulk = await fetch("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcodes: codes }),
    signal,
  });
  const looked = await readJson(bulk);
  const rows = Array.isArray(looked?.result) ? looked.result : [];
  return rows
    .map((row) => {
      const item = record(row);
      const result = item ? record(item.result) : null;
      return result ? placeFromPostcode(result) : null;
    })
    .filter((item): item is PlaceResult => item !== null);
}

/** Towns, cities and postcodes from the free postcodes.io directory (ONS and OS Open Names). */
export async function searchPostcodesIo(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return [];
  const compact = q.replace(/\s+/g, "");
  const tasks = [loadGazetteer(q, signal).catch(() => [] as PlaceResult[])];
  if (/^[A-Za-z]{1,2}\d/i.test(compact)) tasks.push(loadPostcodes(compact, signal).catch(() => [] as PlaceResult[]));
  const groups = await Promise.all(tasks);
  return dedupePlaces(groups.flat());
}
