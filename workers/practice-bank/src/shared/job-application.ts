import {
  PRACTICE_EMPLOYMENT,
  SAMPLE_CV_FILE_NAME,
  SAVED_CV_QUALIFICATIONS,
  SAVED_CV_SKILLS,
  SAVED_CV_STATEMENT,
  cvFileError,
  type PracticeProfile,
} from "./practice-profile";

export type CvChoice = "" | "sample" | "upload";

export type ApplicationDraft = {
  firstName: string;
  surname: string;
  email: string;
  telephone: string;
  addressLine: string;
  town: string;
  postcode: string;
  noExperience: boolean;
  jobTitle: string;
  employerName: string;
  dateFrom: string;
  dateTo: string;
  duties: string;
  skills: string;
  previousExperience: string;
  qualifications: string;
  statement: string;
  cvChoice: CvChoice;
  cvFileName: string;
};

export type ApplicationStep = "personal" | "employment" | "skills" | "documents" | "all";

export const EMPTY_DRAFT: ApplicationDraft = {
  firstName: "",
  surname: "",
  email: "",
  telephone: "",
  addressLine: "",
  town: "",
  postcode: "",
  noExperience: false,
  jobTitle: "",
  employerName: "",
  dateFrom: "",
  dateTo: "",
  duties: "",
  skills: "",
  previousExperience: "",
  qualifications: "",
  statement: "",
  cvChoice: "",
  cvFileName: "",
};

const LIMITS = {
  firstName: 40,
  surname: 40,
  email: 80,
  telephone: 20,
  addressLine: 80,
  town: 40,
  postcode: 10,
  jobTitle: 80,
  employerName: 80,
  dateFrom: 40,
  dateTo: 40,
  duties: 500,
  skills: 400,
  previousExperience: 500,
  qualifications: 300,
  statement: 800,
  cvFileName: 80,
} as const;

export type ApplicationStatus = "submitted" | "under_review" | "interview" | "unsuccessful";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  interview: "Interview invitation",
  unsuccessful: "Unsuccessful",
};

const NAME = /^[A-Za-z][A-Za-z' -]{0,39}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACE = /^[A-Za-z][A-Za-z' -]{1,39}$/;
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** The application a real jobs site would build from the account and the CV already on file. */
export function applicationFromProfile(
  profile: PracticeProfile,
  cvChoice: CvChoice = "sample",
  cvFileName = SAMPLE_CV_FILE_NAME,
): ApplicationDraft {
  return {
    firstName: profile.firstName,
    surname: profile.surname,
    email: profile.email,
    telephone: profile.telephone,
    addressLine: profile.addressLine,
    town: profile.town,
    postcode: profile.postcode,
    noExperience: false,
    jobTitle: PRACTICE_EMPLOYMENT.jobTitle,
    employerName: PRACTICE_EMPLOYMENT.employerName,
    dateFrom: PRACTICE_EMPLOYMENT.dateFrom,
    dateTo: PRACTICE_EMPLOYMENT.dateTo,
    duties: PRACTICE_EMPLOYMENT.duties,
    skills: SAVED_CV_SKILLS,
    previousExperience: PRACTICE_EMPLOYMENT.duties,
    qualifications: SAVED_CV_QUALIFICATIONS,
    statement: SAVED_CV_STATEMENT,
    cvChoice,
    cvFileName: cvChoice === "sample" ? SAMPLE_CV_FILE_NAME : cvFileName,
  };
}

export function readDraft(body: Record<string, unknown>): ApplicationDraft {
  return {
    firstName: clip(body.firstName, LIMITS.firstName),
    surname: clip(body.surname, LIMITS.surname),
    email: clip(body.email, LIMITS.email),
    telephone: clip(body.telephone, LIMITS.telephone),
    addressLine: clip(body.addressLine, LIMITS.addressLine),
    town: clip(body.town, LIMITS.town),
    postcode: clip(body.postcode, LIMITS.postcode).toUpperCase(),
    noExperience: body.noExperience === true || body.noExperience === "true",
    jobTitle: clip(body.jobTitle, LIMITS.jobTitle),
    employerName: clip(body.employerName, LIMITS.employerName),
    dateFrom: clip(body.dateFrom, LIMITS.dateFrom),
    dateTo: clip(body.dateTo, LIMITS.dateTo),
    duties: clip(body.duties, LIMITS.duties),
    skills: clip(body.skills, LIMITS.skills),
    previousExperience: clip(body.previousExperience, LIMITS.previousExperience),
    qualifications: clip(body.qualifications, LIMITS.qualifications),
    statement: clip(body.statement, LIMITS.statement),
    cvChoice: body.cvChoice === "sample" || body.cvChoice === "upload" ? body.cvChoice : "",
    cvFileName: body.cvChoice === "sample" ? SAMPLE_CV_FILE_NAME : clip(body.cvFileName, LIMITS.cvFileName),
  };
}

export function validateDraft(draft: ApplicationDraft, step: ApplicationStep): Record<string, string> {
  const errors: Record<string, string> = {};
  const personal = step === "personal" || step === "all";
  const employment = step === "employment" || step === "all";
  const skills = step === "skills" || step === "all";
  const documents = step === "documents" || step === "all";

  if (personal) {
    if (!NAME.test(draft.firstName)) errors.firstName = "Enter a first name using letters, such as Sam.";
    if (!NAME.test(draft.surname)) errors.surname = "Enter a surname using letters, such as Patel.";
    if (!EMAIL.test(draft.email)) errors.email = "Enter an email address such as sam.learner@example.com.";
    const digits = draft.telephone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) errors.telephone = "Enter a telephone number with at least 10 digits.";
    if (!PLACE.test(draft.town) && !UK_POSTCODE.test(draft.postcode || draft.town)) {
      errors.town = "Search for your address or postcode and choose it from the list, or type a town such as Leeds.";
    }
    if (draft.postcode && !UK_POSTCODE.test(draft.postcode)) errors.postcode = "Choose a UK postcode from the address list.";
  }

  if (employment && !draft.noExperience) {
    if (draft.jobTitle.length < 2) errors.jobTitle = "Enter a job title, or tick that you have no previous paid employment.";
    if (draft.employerName.length < 2) errors.employerName = "Enter the employer name. A practice name is fine.";
    if (draft.dateFrom.length < 4) errors.dateFrom = "Enter a start date, such as March 2024.";
    if (draft.dateTo.length < 4) errors.dateTo = "Enter an end date, such as June 2026, or write Still in this job.";
    if (draft.duties.length < 10) errors.duties = "Write a short description of what you did. A sentence or two is enough.";
  }

  if (skills) {
    if (draft.skills.length < 2) errors.skills = "List a skill, or write None yet.";
    if (draft.previousExperience.length < 2) errors.previousExperience = "Describe any related experience, or write None yet.";
    if (draft.qualifications.length < 2) errors.qualifications = "List a qualification or course, or write None yet.";
    if (draft.statement.length < 30) errors.statement = "Write at least a couple of sentences about why you are suitable. You do not need to share anything private.";
  }

  if (documents) {
    if (draft.cvChoice !== "sample" && draft.cvChoice !== "upload") {
      errors.cvChoice = "Choose the sample CV, or upload a file of your own.";
    } else if (draft.cvChoice === "upload") {
      const problem = cvFileError(draft.cvFileName);
      if (problem) errors.cvFileName = problem;
    }
  }

  return errors;
}

export function practiceStatus(jobId: string, suspicious: boolean): ApplicationStatus {
  if (jobId === "wfj-1040") return "interview";
  if (suspicious) return "submitted";
  const score = [...jobId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3;
  return (["submitted", "under_review", "unsuccessful"] as const)[score];
}

export function interviewDate(submittedAt: string): string {
  const start = new Date(submittedAt);
  const day = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  day.setUTCDate(day.getUTCDate() + 10);
  while (day.getUTCDay() === 0 || day.getUTCDay() === 6) day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}
