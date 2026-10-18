import type { Identity } from "../bank";

/** Contact details that stay the same on every Computer Steps practice website. */
export type PracticeProfile = {
  firstName: string;
  surname: string;
  fullName: string;
  email: string;
  telephone: string;
  addressLine: string;
  town: string;
  postcode: string;
};

export const SAMPLE_CV_FILE_NAME = "ComputerSteps-sample-CV.txt";

export const SAVED_CV_SKILLS = "Clear spoken English. Careful with personal information. Happy to learn new tasks.";
export const SAVED_CV_QUALIFICATIONS = "Computer Steps practice courses";
export const SAVED_CV_STATEMENT =
  "I am applying with the details and CV saved on my Computer Steps account. I am careful, reliable and happy to learn this role.";

/** A short fictional job, so a learner can complete employment history without inventing one. */
export const PRACTICE_EMPLOYMENT = {
  jobTitle: "Customer service assistant",
  employerName: "Townsville Library",
  dateFrom: "March 2024",
  dateTo: "Still in this job",
  duties: "Helped visitors find books, answered the phone and kept the front desk tidy.",
} as const;

const CV_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".rtf"];

function letters(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

/** Ofcom reserves 07700 900000–900999 for use in drama. The same name always gets the same number. */
function dramaTelephone(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (Math.imul(hash, 33) + char.charCodeAt(0)) >>> 0;
  return `07700 900${String(hash % 1000).padStart(3, "0")}`;
}

export function practiceProfileFromIdentity(identity: Identity): PracticeProfile {
  const parts = identity.fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "Alex";
  const surname = parts.slice(1).join(" ") || "Morgan";
  const local = [letters(firstName), letters(surname)].filter(Boolean).join(".") || "learner";
  return {
    firstName,
    surname,
    fullName: identity.fullName,
    email: `${local}@computersteps.practice`,
    telephone: dramaTelephone(`${identity.fullName}|${identity.postcode}`),
    addressLine: identity.addressLine1,
    town: identity.townOrCity,
    postcode: identity.postcode,
  };
}

export function sampleCvText(profile: PracticeProfile): string {
  return [
    "Computer Steps sample CV",
    "This CV is fictional. It is for practice on Westford Jobs and is not sent to an employer.",
    "",
    profile.fullName,
    profile.email,
    profile.telephone,
    `${profile.addressLine}, ${profile.town}, ${profile.postcode}`,
    "",
    "Experience",
    `${PRACTICE_EMPLOYMENT.jobTitle}, ${PRACTICE_EMPLOYMENT.employerName}`,
    `${PRACTICE_EMPLOYMENT.dateFrom} to present`,
    PRACTICE_EMPLOYMENT.duties,
    "",
    "Skills",
    SAVED_CV_SKILLS,
  ].join("\n");
}

export function cvFileError(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Choose a file. Its name will appear here so you can check it.";
  if (trimmed.length > 80 || /[\\/]/.test(trimmed) || trimmed.includes("..")) {
    return "Choose a file with a short name and no folder path.";
  }
  const lower = trimmed.toLowerCase();
  if (!CV_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return "Choose a PDF, Word document or text file (.pdf, .doc, .docx, .txt or .rtf).";
  }
  return null;
}
