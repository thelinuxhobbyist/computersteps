// Fictional Westford Jobs catalogue and search.
// The vacancies are shared practice content, not learner records. They stay in this file
// so the one-year account cleanup cannot delete them. Saved jobs, applications and
// exercise progress are stored per learner in D1 and removed with the account.

export const JOBS_SITE = {
  name: "Westford Jobs",
  email: "help@westfordjobs.practice",
  phone: "0306 999 0148",
} as const;

export const JOB_CATEGORIES = [
  { id: "warehouse", label: "Warehouse and logistics" },
  { id: "retail", label: "Retail" },
  { id: "cleaning", label: "Cleaning" },
  { id: "driving", label: "Driving and delivery" },
  { id: "customer-service", label: "Customer service" },
  { id: "administration", label: "Administration" },
  { id: "hospitality", label: "Hospitality" },
  { id: "care", label: "Health and care" },
  { id: "it", label: "IT and digital" },
  { id: "finance", label: "Finance" },
  { id: "education", label: "Education" },
  { id: "security", label: "Security" },
  { id: "maintenance", label: "Maintenance" },
  { id: "hr", label: "Human resources" },
  { id: "marketing", label: "Marketing and communications" },
  { id: "construction", label: "Construction" },
  { id: "manufacturing", label: "Manufacturing" },
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number]["id"];
export type JobHours = "full-time" | "part-time";
export type JobContract = "permanent" | "temporary" | "fixed-term" | "contract";
export type JobWorkplace = "on-site" | "hybrid" | "remote";
export type JobExperience = "entry" | "some" | "experienced";
export type PayPeriod = "year" | "hour" | "day" | "week" | "task";
export type JobSponsorship = "not-offered" | "available";

export const HOURS_LABELS: Record<JobHours, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
};

export const CONTRACT_LABELS: Record<JobContract, string> = {
  permanent: "Permanent",
  temporary: "Temporary",
  "fixed-term": "Fixed-term",
  contract: "Contract",
};

export const WORKPLACE_LABELS: Record<JobWorkplace, string> = {
  "on-site": "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const EXPERIENCE_LABELS: Record<JobExperience, string> = {
  entry: "Entry level",
  some: "Some experience",
  experienced: "Experienced",
};

export const SPONSORSHIP_LABELS: Record<JobSponsorship, string> = {
  "not-offered": "No visa sponsorship",
  available: "Sponsorship may be available",
};

/** Places a learner can type as one area. Town names stay on each vacancy. */
export const LOCATION_GROUPS: { label: string; places: string[] }[] = [
  {
    label: "West London",
    places: ["Ealing", "West Ealing", "Acton", "Southall", "Hanwell", "Greenford", "Hounslow", "Brentford", "Hammersmith", "Wembley"],
  },
];

export const SALARY_BANDS = [
  { id: "under-24000", label: "Under £24,000 a year", min: 0, max: 23999 },
  { id: "24000-31999", label: "£24,000 to £31,999 a year", min: 24000, max: 31999 },
  { id: "32000-plus", label: "£32,000 and above", min: 32000, max: Number.POSITIVE_INFINITY },
] as const;

export type SalaryBandId = (typeof SALARY_BANDS)[number]["id"];
export type JobSort = "relevant" | "newest" | "salary";

export const SORT_LABELS: Record<JobSort, string> = {
  relevant: "Most relevant",
  newest: "Newest",
  salary: "Highest salary",
};

export const EXAMPLE_SEARCHES = [
  "Warehouse operative",
  "Retail assistant",
  "Cleaner",
  "Delivery driver",
  "Customer service adviser",
  "Administrator",
  "Receptionist",
  "Care assistant",
  "Kitchen assistant",
  "Hotel receptionist",
  "IT support technician",
  "Junior web developer",
  "Accounts assistant",
  "Teaching assistant",
  "Security officer",
  "Maintenance operative",
  "Office administrator",
  "Human resources administrator",
  "Marketing assistant",
  "Production operative",
  "Apprentice",
] as const;

export const PAGE_SIZE = 8;

export type VacancyInput = {
  id: string;
  title: string;
  employer: string;
  category: JobCategory;
  town: string;
  city: string;
  postcode: string;
  area?: string;
  payPeriod: PayPeriod;
  payMin: number;
  payMax: number;
  hoursPerWeek: number;
  hours: JobHours;
  hoursDetail: string;
  contract: JobContract;
  workplace: JobWorkplace;
  experience: JobExperience;
  summary: string;
  responsibilities: string[];
  essential: string[];
  desirable: string[];
  qualifications: string[];
  postedOn: string;
  closesOn: string;
  featured?: boolean;
  /** The advert itself contains the warning. The listing is not stamped as a scam. */
  suspicious?: boolean;
  keywords?: string[];
  /** Omitted vacancies require existing right to work and do not offer sponsorship. */
  sponsorship?: JobSponsorship;
  /** Shown when sponsorship may be available. Must also appear in the requirements. */
  sponsorshipCondition?: string;
  /** Replaces the standard right-to-work wording when an advert needs a different sentence. */
  rightToWork?: string;
  benefits?: string[];
  howToApply?: string;
  apprenticeship?: boolean;
};

export type Vacancy = VacancyInput & {
  reference: string;
  payLabel: string;
  payAnnualMin: number;
  payAnnualMax: number;
  entryLevel: boolean;
  sponsorship: JobSponsorship;
  rightToWork: string;
  benefits: string[];
  howToApply: string;
  apprenticeship: boolean;
};

export type JobQuery = {
  q: string;
  where: string;
  category: string;
  hours: string;
  contract: string;
  salary: string;
  experience: string;
  workplace: string;
  sponsorship: string;
  sort: JobSort;
  page: number;
};

export function categoryLabel(id: string): string {
  return JOB_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function formatPounds(amount: number): string {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

export function formatUkDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatLocation(job: Pick<Vacancy, "area" | "town" | "city" | "workplace">): string {
  if (job.workplace === "remote" && job.town === "Remote") return "Remote, United Kingdom";
  if (job.area) return `${job.area}, ${job.town}`;
  if (job.town === job.city) return job.town;
  return `${job.town}, ${job.city}`;
}

export function normText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function squash(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function annualise(period: PayPeriod, amount: number, hoursPerWeek: number): number {
  if (period === "hour") return Math.round(amount * hoursPerWeek * 52);
  if (period === "day") return Math.round(amount * 5 * 52);
  if (period === "week") return Math.round(amount * 52);
  if (period === "task") return Math.round(amount * 40);
  return Math.round(amount);
}

function buildPayLabel(input: VacancyInput): string {
  const min = formatPounds(input.payMin);
  const max = formatPounds(input.payMax);
  const suffix =
    input.payPeriod === "hour"
      ? "an hour"
      : input.payPeriod === "day"
        ? "a day"
        : input.payPeriod === "week"
          ? "a week"
          : input.payPeriod === "task"
            ? "for each task"
            : "a year";
  return input.payMin === input.payMax ? `${min} ${suffix}` : `${min} to ${max} ${suffix}`;
}

export const PRACTICE_APPLY =
  "Select Apply now on this practice page. The form stays on your Computer Steps account. It is not sent to a real employer, and you should use fictional details.";

export function rightToWorkText(input: Pick<VacancyInput, "sponsorship" | "sponsorshipCondition" | "rightToWork">): string {
  if (input.rightToWork) return input.rightToWork;
  if (input.sponsorship === "available") {
    const condition = input.sponsorshipCondition?.trim() || "the essential requirements in this advert";
    return `Sponsorship may be available for eligible applicants who already meet this condition: ${condition}. This is a fictional practice vacancy and is not immigration advice.`;
  }
  return "You must already have the right to work in the UK. This employer does not offer visa sponsorship. This is a fictional practice vacancy and is not immigration advice.";
}

export function toVacancy(input: VacancyInput): Vacancy {
  const sponsorship = input.sponsorship ?? "not-offered";
  return {
    ...input,
    sponsorship,
    reference: input.id.replace(/^wfj-/i, "WFJ-").toUpperCase(),
    payLabel: buildPayLabel(input),
    payAnnualMin: annualise(input.payPeriod, input.payMin, input.hoursPerWeek),
    payAnnualMax: annualise(input.payPeriod, input.payMax, input.hoursPerWeek),
    entryLevel: input.experience === "entry",
    rightToWork: rightToWorkText({ ...input, sponsorship }),
    benefits: input.benefits ?? [],
    howToApply: input.howToApply ?? PRACTICE_APPLY,
    apprenticeship: input.apprenticeship ?? false,
  };
}

export function getJob(jobs: readonly Vacancy[], id: string): Vacancy | undefined {
  const key = id.trim().toLowerCase();
  return jobs.find((job) => job.id === key || job.reference.toLowerCase() === key);
}

const CATEGORY_SEARCH_WORDS: Partial<Record<JobCategory, string>> = {
  administration: "office administrator admin clerical",
  "customer-service": "customer service call centre call center",
  warehouse: "warehouse logistics",
  retail: "retail sales shop",
  cleaning: "cleaning facilities",
  driving: "driving delivery transport courier",
  hospitality: "hospitality catering kitchen hotel",
  care: "care support",
  it: "it support technology digital",
  finance: "accounting finance accounts",
  education: "teaching education school",
  security: "security",
  maintenance: "maintenance facilities repairs",
  hr: "human resources hr recruitment",
  marketing: "marketing communications",
  construction: "construction building maintenance",
  manufacturing: "manufacturing production factory",
};

function searchBlob(job: Vacancy): string {
  return normText(
    [
      job.title,
      job.employer,
      job.summary,
      job.reference,
      categoryLabel(job.category),
      CATEGORY_SEARCH_WORDS[job.category] ?? "",
      formatLocation(job),
      job.town,
      job.city,
      job.area ?? "",
      job.postcode,
      job.rightToWork,
      job.howToApply,
      job.apprenticeship ? "apprentice apprenticeship" : "",
      job.experience === "entry" ? "entry level" : "",
      job.sponsorship === "available" ? "visa sponsorship" : "",
      ...(job.keywords ?? []),
      ...job.responsibilities,
      ...job.essential,
      ...job.desirable,
      ...job.qualifications,
      ...job.benefits,
    ].join(" "),
  );
}

function tokensOf(query: string): string[] {
  return normText(query)
    .split(" ")
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

const WORD_FAMILIES: readonly (readonly string[])[] = [
  ["editing", "editor", "editors", "proofreader", "proofreaders", "proofreading", "copywriter", "copywriters", "copywriting"],
  ["administrator", "administrators", "admin", "administration"],
  ["receptionist", "receptionists", "reception"],
  ["cleaner", "cleaners", "cleaning"],
  ["driver", "drivers", "driving", "delivery", "courier", "couriers"],
  ["apprentice", "apprentices", "apprenticeship", "apprenticeships"],
  ["customer", "customers"],
  ["centre", "center"],
];

const STOP_WORDS = new Set([
  "job",
  "jobs",
  "work",
  "the",
  "and",
  "for",
  "with",
  "role",
  "roles",
  "vacancy",
  "vacancies",
  "position",
  "positions",
  "of",
  "to",
  "in",
  "on",
  "at",
  "or",
  "a",
  "an",
  "from",
  "required",
  "requirement",
]);

function equivalents(token: string): string[] {
  const family = WORD_FAMILIES.find((words) => words.includes(token));
  return family ? [...family] : [token];
}

function blobHas(blob: string, token: string): boolean {
  return equivalents(token).some((word) => blob.includes(word));
}

function locationGroup(where: string) {
  const query = normText(where);
  return LOCATION_GROUPS.find((group) => normText(group.label) === query);
}

function locationMatches(job: Vacancy, where: string): boolean {
  const query = normText(where);
  if (query.length < 2) return true;
  const group = locationGroup(where);
  if (group) {
    const town = normText(job.town);
    const area = normText(job.area ?? "");
    return group.places.some((place) => {
      const name = normText(place);
      return town === name || area === name;
    });
  }
  const postcode = squash(job.postcode);
  const written = where.toUpperCase().match(/\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/);
  if (written) return postcode === squash(`${written[1]}${written[2]}`);
  const hay = normText([job.area, job.town, job.city, job.postcode, formatLocation(job)].filter(Boolean).join(" "));
  if (hay.includes(query)) return true;
  const flat = squash(where);
  if (postcode && flat.length >= 2 && postcode.startsWith(flat)) return true;
  const places = [job.area, job.town, job.city].map((part) => normText(part ?? "")).filter((part) => part.length >= 4);
  return places.some((part) => query.includes(part));
}

function scoreJob(job: Vacancy, tokens: string[], phrase: string): number {
  if (!tokens.length) return 0;
  const title = normText(job.title);
  const employer = normText(job.employer);
  let score = 0;
  if (phrase && title === phrase) score += 50;
  if (phrase && title.includes(phrase)) score += 30;
  if (phrase && employer.includes(phrase)) score += 24;
  for (const token of tokens) {
    const words = equivalents(token);
    if (words.some((word) => title.includes(word))) score += 8;
    if (words.some((word) => employer.includes(word))) score += 5;
    if (words.some((word) => normText(categoryLabel(job.category)).includes(word))) score += 2;
  }
  return score;
}

function salaryOverlaps(job: Vacancy, bandId: string): boolean {
  const band = SALARY_BANDS.find((item) => item.id === bandId);
  if (!band) return true;
  return job.payAnnualMin <= band.max && job.payAnnualMax >= band.min;
}

function knownPlaces(jobs: readonly Vacancy[]): { norm: string; label: string }[] {
  const found = new Map<string, string>();
  for (const group of LOCATION_GROUPS) found.set(normText(group.label), group.label);
  for (const job of jobs) {
    for (const part of [job.area, job.town, job.city]) {
      const label = part?.trim();
      if (!label) continue;
      const norm = normText(label);
      if (norm.length >= 3 && !found.has(norm)) found.set(norm, label);
    }
  }
  return [...found.entries()]
    .map(([norm, label]) => ({ norm, label }))
    .sort((a, b) => b.norm.length - a.norm.length);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripPhrase(value: string, phrase: string): string {
  const pattern = phrase
    .trim()
    .split(/\s+/)
    .map(escapeRegExp)
    .join("[\\s-]+");
  return value.replace(new RegExp(`\\b${pattern}\\b`, "i"), " ").replace(/\s+/g, " ").trim();
}

const FILLER_WORDS = new Set(["a", "an", "and", "for", "job", "jobs", "required", "the", "with", "work"]);

function dropFiller(value: string): string {
  const words = value.split(" ").filter(Boolean);
  return words.every((word) => FILLER_WORDS.has(normText(word))) ? "" : value;
}

/** Pulls place, hours, experience and sponsorship out of a single search sentence. */
export function refineJobQuery(jobs: readonly Vacancy[], query: JobQuery): JobQuery {
  let q = query.q.replace(/\s+/g, " ").trim();
  let where = query.where;
  let hours = query.hours;
  let experience = query.experience;
  let sponsorship = query.sponsorship;
  const readable = normText(q);

  if (!where) {
    const place = knownPlaces(jobs).find((item) => readable.endsWith(` in ${item.norm}`));
    if (place) {
      const ending = q.match(new RegExp(`\\s+in\\s+${escapeRegExp(place.label)}\\s*$`, "i"));
      if (ending?.index != null) {
        where = place.label;
        q = q.slice(0, ending.index).trim();
      }
    }
  }

  const experiencePhrases = ["no previous experience", "no experience required", "no experience", "entry level"];
  if (!experience) {
    const phrase = experiencePhrases.find((item) => normText(q).includes(item));
    if (phrase) {
      experience = "entry";
      q = stripPhrase(q, phrase);
    }
  }

  const asksForSponsorship = normText(q).includes("sponsorship") && !/\b(no|not|without)\b/.test(normText(q));
  if (!sponsorship && asksForSponsorship) {
    sponsorship = "available";
    for (const phrase of ["visa sponsorship", "sponsorship available", "with sponsorship", "sponsorship"]) {
      q = stripPhrase(q, phrase);
    }
  }

  const flat = normText(q).replace(/ /g, "");
  if (!hours && (normText(q).includes("part time") || flat.includes("parttime"))) {
    hours = "part-time";
    q = stripPhrase(stripPhrase(q, "part time"), "parttime");
  } else if (!hours && (normText(q).includes("full time") || flat.includes("fulltime"))) {
    hours = "full-time";
    q = stripPhrase(stripPhrase(q, "full time"), "fulltime");
  }

  return { ...query, q: dropFiller(q), where, hours, experience, sponsorship };
}

export function searchJobs(jobs: readonly Vacancy[], query: JobQuery): { total: number; results: Vacancy[] } {
  query = refineJobQuery(jobs, query);
  const tokens = tokensOf(query.q);
  const phrase = tokens.join(" ");
  const matched = jobs
    .map((job) => ({ job, blob: searchBlob(job), score: scoreJob(job, tokens, phrase) }))
    .filter(({ job, blob }) => {
      if (tokens.length && !tokens.every((token) => blobHas(blob, token))) return false;
      if (!locationMatches(job, query.where)) return false;
      if (query.category && job.category !== query.category) return false;
      if (query.hours && job.hours !== query.hours) return false;
      if (query.contract && job.contract !== query.contract) return false;
      if (query.experience && job.experience !== query.experience) return false;
      if (query.workplace && job.workplace !== query.workplace) return false;
      if (query.sponsorship && job.sponsorship !== query.sponsorship) return false;
      if (query.salary && !salaryOverlaps(job, query.salary)) return false;
      return true;
    });

  matched.sort((a, b) => {
    if (query.sort === "salary" && b.job.payAnnualMax !== a.job.payAnnualMax) return b.job.payAnnualMax - a.job.payAnnualMax;
    if (query.sort === "relevant" && tokens.length && b.score !== a.score) return b.score - a.score;
    if (a.job.postedOn !== b.job.postedOn) return b.job.postedOn.localeCompare(a.job.postedOn);
    return b.job.id.localeCompare(a.job.id);
  });

  const page = Math.max(1, query.page || 1);
  const start = (page - 1) * PAGE_SIZE;
  return { total: matched.length, results: matched.slice(start, start + PAGE_SIZE).map((item) => item.job) };
}

export function emptyJobQuery(): JobQuery {
  return {
    q: "",
    where: "",
    category: "",
    hours: "",
    contract: "",
    salary: "",
    experience: "",
    workplace: "",
    sponsorship: "",
    sort: "relevant",
    page: 1,
  };
}

export function parseJobQuery(params: URLSearchParams): JobQuery {
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  return {
    q: (params.get("q") ?? "").replace(/\s+/g, " ").trim(),
    where: (params.get("where") ?? "").replace(/\s+/g, " ").trim(),
    category: JOB_CATEGORIES.some((item) => item.id === params.get("category")) ? (params.get("category") ?? "") : "",
    hours: params.get("hours") === "full-time" || params.get("hours") === "part-time" ? params.get("hours")! : "",
    contract: params.get("contract") && params.get("contract")! in CONTRACT_LABELS ? params.get("contract")! : "",
    salary: SALARY_BANDS.some((item) => item.id === params.get("salary")) ? (params.get("salary") ?? "") : "",
    experience: params.get("experience") && params.get("experience")! in EXPERIENCE_LABELS ? params.get("experience")! : "",
    workplace: params.get("workplace") && params.get("workplace")! in WORKPLACE_LABELS ? params.get("workplace")! : "",
    sponsorship: params.get("sponsorship") === "available" || params.get("sponsorship") === "not-offered" ? params.get("sponsorship")! : "",
    sort: sort === "newest" || sort === "salary" || sort === "relevant" ? sort : "relevant",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function jobQueryString(query: JobQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.where) params.set("where", query.where);
  if (query.category) params.set("category", query.category);
  if (query.hours) params.set("hours", query.hours);
  if (query.contract) params.set("contract", query.contract);
  if (query.salary) params.set("salary", query.salary);
  if (query.experience) params.set("experience", query.experience);
  if (query.workplace) params.set("workplace", query.workplace);
  if (query.sponsorship) params.set("sponsorship", query.sponsorship);
  if (query.sort !== "relevant") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export type ActiveFilter = { key: keyof JobQuery; label: string };

export function activeFilters(query: JobQuery): ActiveFilter[] {
  const filters: ActiveFilter[] = [];
  if (query.q) filters.push({ key: "q", label: `Keyword: ${query.q}` });
  if (query.where) filters.push({ key: "where", label: `Location: ${query.where}` });
  if (query.category) filters.push({ key: "category", label: `Category: ${categoryLabel(query.category)}` });
  if (query.hours) filters.push({ key: "hours", label: `Hours: ${HOURS_LABELS[query.hours as JobHours]}` });
  if (query.contract) filters.push({ key: "contract", label: `Type: ${CONTRACT_LABELS[query.contract as JobContract]}` });
  if (query.salary) filters.push({ key: "salary", label: `Salary: ${SALARY_BANDS.find((band) => band.id === query.salary)?.label ?? query.salary}` });
  if (query.experience) filters.push({ key: "experience", label: `Experience: ${EXPERIENCE_LABELS[query.experience as JobExperience]}` });
  if (query.workplace) filters.push({ key: "workplace", label: `Workplace: ${WORKPLACE_LABELS[query.workplace as JobWorkplace]}` });
  if (query.sponsorship) {
    filters.push({ key: "sponsorship", label: `Sponsorship: ${SPONSORSHIP_LABELS[query.sponsorship as JobSponsorship]}` });
  }
  return filters;
}

export type SearchAlternative = {
  label: string;
  reason: string;
  query: JobQuery;
};

function broaderPlaces(jobs: readonly Vacancy[], where: string): string[] {
  const query = normText(where);
  const cities = new Set<string>();
  for (const job of jobs) {
    const town = normText(job.town);
    const area = normText(job.area ?? "");
    const city = job.city.trim();
    if (!city || normText(city) === query) continue;
    if (town === query || area === query) cities.add(city);
  }
  return [...cities];
}

export function explainEmptySearch(
  jobs: readonly Vacancy[],
  query: JobQuery,
): { detail: string; alternatives: SearchAlternative[]; related: { reason: string; jobs: Vacancy[] } | null } {
  query = refineJobQuery(jobs, query);
  const alternatives: (SearchAlternative & { total: number })[] = [];
  const seen = new Set<string>();
  const currentKey = jobQueryString({ ...query, sort: "relevant", page: 1 });

  const offer = (label: string, reason: string, next: JobQuery) => {
    const normalised = { ...next, sort: query.sort, page: 1 };
    const key = jobQueryString(normalised);
    if (!key || key === currentKey || seen.has(key)) return;
    const found = searchJobs(jobs, normalised);
    if (!found.total) return;
    seen.add(key);
    const count = found.total === 1 ? "1 job" : `${found.total} jobs`;
    alternatives.push({ label: `${label} (${count})`, reason, query: normalised, total: found.total });
  };

  if (query.category) {
    offer(`Remove ${categoryLabel(query.category)}`, `${categoryLabel(query.category)} is only applied because that filter is selected.`, {
      ...query,
      category: "",
    });
  }
  if (query.hours) offer("Any working hours", "Working hours are limiting this search.", { ...query, hours: "" });
  if (query.contract) offer("Any employment type", "Employment type is limiting this search.", { ...query, contract: "" });
  if (query.salary) offer("Any salary", "The salary band is limiting this search.", { ...query, salary: "" });
  if (query.experience) offer("Any experience level", "Experience level is limiting this search.", { ...query, experience: "" });
  if (query.workplace) offer("Any workplace", "Workplace is limiting this search.", { ...query, workplace: "" });
  if (query.sponsorship) offer("Any sponsorship option", "The sponsorship filter is limiting this search.", { ...query, sponsorship: "" });
  if (query.q) {
    const place = query.where ? ` in ${query.where}` : "";
    const kind = query.category ? `${categoryLabel(query.category)} jobs` : "Jobs";
    offer(`${kind}${place} without “${query.q}”`, `These vacancies are in the same search, without the word “${query.q}”.`, { ...query, q: "" });
  }
  if (query.where) {
    const kept = query.category ? `, ${categoryLabel(query.category)}` : "";
    offer(query.q ? `“${query.q}” anywhere${kept}` : "Jobs anywhere", "These vacancies are outside that place.", { ...query, where: "" });
    for (const city of broaderPlaces(jobs, query.where)) {
      offer(
        query.q ? `“${query.q}” in ${city}${kept}` : `Jobs in ${city}`,
        `${query.where} is in ${city}. These vacancies are in ${city}, not only in ${query.where}.`,
        { ...query, where: city },
      );
      if (query.category && query.q) {
        offer(`All “${query.q}” jobs in ${city}`, `These “${query.q}” vacancies are in ${city}, in any category.`, {
          ...query,
          where: city,
          category: "",
        });
      }
    }
  }

  alternatives.sort((a, b) => rankAlternative(b, query) - rankAlternative(a, query));
  const best = alternatives[0];
  const relatedJobs = best ? searchJobs(jobs, best.query).results.slice(0, 3) : [];
  const parts = [emptyDetail(query)];
  if (query.category) parts.push(`${categoryLabel(query.category)} is only applied because that filter is selected.`);
  if (best && !parts.includes(best.reason)) parts.push(best.reason);

  return {
    detail: parts.join(" "),
    alternatives: alternatives.slice(0, 4).map(({ label, reason, query: next }) => ({ label, reason, query: next })),
    related: best && relatedJobs.length ? { reason: best.reason, jobs: relatedJobs } : null,
  };
}

function emptyDetail(query: JobQuery): string {
  if (query.q && query.where) return `There are no vacancies for “${query.q}” in ${query.where}.`;
  if (query.q) return `There are no vacancies for “${query.q}”.`;
  if (query.where) return `There are no vacancies in ${query.where}.`;
  return "No vacancies match these filters.";
}

function rankAlternative(item: SearchAlternative & { total: number }, query: JobQuery): number {
  let score = Math.min(item.total, 20);
  if (query.q && item.query.q) score += 100;
  if (query.where && item.query.where) score += 40;
  if (query.category && item.query.category) score += 30;
  return score;
}
