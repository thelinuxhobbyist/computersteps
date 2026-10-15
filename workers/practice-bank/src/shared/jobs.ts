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
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number]["id"];
export type JobHours = "full-time" | "part-time";
export type JobContract = "permanent" | "temporary" | "fixed-term" | "contract";
export type JobWorkplace = "on-site" | "hybrid" | "remote";
export type JobExperience = "entry" | "some" | "experienced";
export type PayPeriod = "year" | "hour" | "day" | "week" | "task";

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
};

export type Vacancy = VacancyInput & {
  reference: string;
  payLabel: string;
  payAnnualMin: number;
  payAnnualMax: number;
  entryLevel: boolean;
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

export function toVacancy(input: VacancyInput): Vacancy {
  return {
    ...input,
    reference: input.id.replace(/^wfj-/i, "WFJ-").toUpperCase(),
    payLabel: buildPayLabel(input),
    payAnnualMin: annualise(input.payPeriod, input.payMin, input.hoursPerWeek),
    payAnnualMax: annualise(input.payPeriod, input.payMax, input.hoursPerWeek),
    entryLevel: input.experience === "entry",
  };
}

export function getJob(jobs: readonly Vacancy[], id: string): Vacancy | undefined {
  const key = id.trim().toLowerCase();
  return jobs.find((job) => job.id === key || job.reference.toLowerCase() === key);
}

function searchBlob(job: Vacancy): string {
  return normText(
    [
      job.title,
      job.employer,
      job.summary,
      job.reference,
      categoryLabel(job.category),
      formatLocation(job),
      job.town,
      job.city,
      job.area ?? "",
      job.postcode,
      ...(job.keywords ?? []),
      ...job.responsibilities,
      ...job.essential,
      ...job.qualifications,
    ].join(" "),
  );
}

function tokensOf(query: string): string[] {
  return normText(query)
    .split(" ")
    .filter((token) => token.length >= 2);
}

function locationMatches(job: Vacancy, where: string): boolean {
  const query = normText(where);
  if (query.length < 2) return true;
  const hay = normText([job.area, job.town, job.city, job.postcode, formatLocation(job)].filter(Boolean).join(" "));
  if (hay.includes(query)) return true;
  const flat = squash(where);
  const postcode = squash(job.postcode);
  if (postcode && flat.length >= 2 && postcode.startsWith(flat)) return true;
  const places = [job.area, job.town, job.city].map((part) => normText(part ?? "")).filter((part) => part.length >= 4);
  if (places.some((part) => query.includes(part))) return true;
  const found = where.toUpperCase().match(/\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/);
  return Boolean(found && postcode.startsWith(squash(found[1])));
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
    if (title.includes(token)) score += 8;
    if (employer.includes(token)) score += 5;
    if (normText(categoryLabel(job.category)).includes(token)) score += 2;
  }
  return score;
}

function salaryOverlaps(job: Vacancy, bandId: string): boolean {
  const band = SALARY_BANDS.find((item) => item.id === bandId);
  if (!band) return true;
  return job.payAnnualMin <= band.max && job.payAnnualMax >= band.min;
}

export function searchJobs(jobs: readonly Vacancy[], query: JobQuery): { total: number; results: Vacancy[] } {
  const tokens = tokensOf(query.q);
  const phrase = tokens.join(" ");
  const matched = jobs
    .map((job) => ({ job, score: scoreJob(job, tokens, phrase) }))
    .filter(({ job }) => {
      if (tokens.length && !tokens.every((token) => searchBlob(job).includes(token))) return false;
      if (!locationMatches(job, query.where)) return false;
      if (query.category && job.category !== query.category) return false;
      if (query.hours && job.hours !== query.hours) return false;
      if (query.contract && job.contract !== query.contract) return false;
      if (query.experience && job.experience !== query.experience) return false;
      if (query.workplace && job.workplace !== query.workplace) return false;
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
  if (query.category) filters.push({ key: "category", label: categoryLabel(query.category) });
  if (query.hours) filters.push({ key: "hours", label: HOURS_LABELS[query.hours as JobHours] });
  if (query.contract) filters.push({ key: "contract", label: CONTRACT_LABELS[query.contract as JobContract] });
  if (query.salary) filters.push({ key: "salary", label: SALARY_BANDS.find((band) => band.id === query.salary)?.label ?? query.salary });
  if (query.experience) filters.push({ key: "experience", label: EXPERIENCE_LABELS[query.experience as JobExperience] });
  if (query.workplace) filters.push({ key: "workplace", label: WORKPLACE_LABELS[query.workplace as JobWorkplace] });
  return filters;
}
