import { interviewDate, type ApplicationStatus } from "./shared/job-application";
import { VACANCIES } from "./shared/job-catalogue";
import { formatUkDate, normText } from "./shared/jobs";
import { JOB_EXERCISES } from "./shared/job-exercises";

export type ExerciseApplication = {
  jobId: string;
  reference: string;
  telephone: string;
  town: string;
  status: ApplicationStatus;
  submittedAt: string;
};

export type ExerciseSnapshot = {
  savedJobIds: string[];
  applications: ExerciseApplication[];
};

export type ExerciseCheck = {
  correct: boolean;
  feedback: string;
  needsSignIn?: boolean;
};

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function sameDay(input: string, iso: string): boolean {
  const raw = input.trim().toLowerCase().replace(/,/g, "");
  if (raw === iso) return true;
  const numeric = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (numeric) return `${numeric[3]}-${numeric[2].padStart(2, "0")}-${numeric[1].padStart(2, "0")}` === iso;
  const long = raw.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})$/);
  if (!long) return false;
  const month = MONTHS.indexOf(long[2]);
  if (month < 0) return false;
  return `${long[3]}-${String(month + 1).padStart(2, "0")}-${long[1].padStart(2, "0")}` === iso;
}

function looseMatch(answer: string, accepted: string[]): boolean {
  const typed = normText(answer);
  if (typed.length < 3) return false;
  return accepted.some((item) => {
    const expected = normText(item);
    return typed === expected || typed.includes(expected) || (expected.includes(typed) && typed.length >= 5);
  });
}

function fullTitle(answer: string, titles: string[]): boolean {
  const typed = normText(answer);
  if (typed.length < 3) return false;
  return titles.some((title) => {
    const expected = normText(title);
    return typed === expected || typed.includes(expected);
  });
}

function referenceMatches(answer: string, reference: string): boolean {
  const typed = answer.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const expected = reference.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return typed === expected;
}

function moneyMentions(answer: string, amount: string): boolean {
  return answer.toLowerCase().replace(/£/g, "").replace(/\s+/g, "").includes(amount);
}

function isHalfTen(answer: string): boolean {
  const flat = answer.toLowerCase().replace(/\s+/g, "").replace(/\./g, ":");
  return flat === "10:30" || flat === "10:30am" || flat === "1030";
}

function signIn(): ExerciseCheck {
  return {
    correct: false,
    needsSignIn: true,
    feedback: "Sign in with your Computer Steps username first. Saved jobs and practice applications are kept on that account, then this check can see them.",
  };
}

function warehouseEmployers(): string[] {
  return VACANCIES.filter((job) => normText(job.title).includes("warehouse operative")).map((job) => job.employer);
}

function ealingTitles(): string[] {
  return VACANCIES.filter((job) => normText(job.town) === "ealing" || normText(job.city) === "ealing").map((job) => job.title);
}

export function checkJobExercise(exerciseId: string, answer: string, answers: string[], snapshot: ExerciseSnapshot | null): ExerciseCheck {
  const exercise = JOB_EXERCISES.find((item) => item.id === exerciseId);
  if (!exercise) return { correct: false, feedback: "That practice task could not be found." };
  if (exercise.needsAccount && !snapshot) return signIn();

  const saved = new Set(snapshot?.savedJobIds ?? []);
  const applications = snapshot?.applications ?? [];
  const latestFor = (jobId: string) => applications.find((item) => item.jobId === jobId);

  switch (exerciseId) {
    case "find-search":
      return normText(answer) === "search jobs"
        ? { correct: true, feedback: "The button says Search jobs. That is the control that runs your search." }
        : { correct: false, feedback: "Look again at Find jobs. The button beside the two search boxes has two words on it. Read those words and type them here." };
    case "search-warehouse":
      return looseMatch(answer, warehouseEmployers())
        ? { correct: true, feedback: "That employer is advertising a warehouse operative in this practice list. Different searches can show more than one employer." }
        : { correct: false, feedback: "Search for warehouse operative, then copy an employer name from under a job title. The employer is not the same as the place name." };
    case "search-ealing":
      return fullTitle(answer, ealingTitles())
        ? { correct: true, feedback: "That job title is listed in Ealing. Location search looks at the town, the city and the postcode." }
        : { correct: false, feedback: "Type Ealing in the location box and search. Then type the full job title from one result, such as the words in the large heading." };
    case "open-vacancy":
      return referenceMatches(answer, "WFJ-1001")
        ? { correct: true, feedback: "WFJ-1001 is the reference on the Northgate Storage advert. A reference helps you find the same vacancy again." }
        : { correct: false, feedback: "Open the Warehouse operative advert at Northgate Storage. The reference begins with WFJ- and is shown with the location and pay." };
    case "find-salary":
      return moneyMentions(answer, "12.21")
        ? { correct: true, feedback: "The advert offers £12.21 an hour. Always check whether a figure is an hour, a year or something else." }
        : { correct: false, feedback: "Open the Northgate Storage advert and read the pay near the top. Include the amount. It is an hourly rate, not a yearly salary." };
    case "full-or-part":
      return answers.includes("part-time") && answers.length === 1
        ? { correct: true, feedback: "Harrow Lane Stores is advertising 16 hours a week, so the job is part-time. The working-hours line tells you which shifts." }
        : { correct: false, feedback: "Open the Harrow Lane Stores retail assistant advert. The hours line says part-time and lists a small number of hours each week." };
    case "closing-date":
      return sameDay(answer, "2026-11-06")
        ? { correct: true, feedback: `Applications close on ${formatUkDate("2026-11-06")}. On a real site you would need to apply before that date.` }
        : { correct: false, feedback: "On the Northgate Storage advert, find Apply by. You can type the date as 6 November 2026 or 06/11/2026." };
    case "part-time-retail":
      return fullTitle(answer, ["Retail assistant"])
        ? { correct: true, feedback: "Kirkstall Market Hall is advertising a part-time retail assistant in Leeds. The filters kept the hours and the place together." }
        : { correct: false, feedback: "Search for retail assistant in Leeds and set Hours to Part-time. Type the full job title from the result, not the employer." };
    case "filter-contract":
      return referenceMatches(answer, "WFJ-1024")
        ? { correct: true, feedback: "WFJ-1024 is the temporary specialist cleaner at Clearpath Homes. The employment-type filter hid the permanent jobs." }
        : { correct: false, feedback: "Set Employment type to Temporary, open Specialist cleaner at Clearpath Homes, and copy the reference that begins with WFJ-." };
    case "salary-range":
      return looseMatch(answer, ["Bramble Digital"])
        ? { correct: true, feedback: "Bramble Digital advertises the junior web developer role from £32,000 a year. A much higher figure with very little detail is a reason to be careful, not automatically a better job." }
        : { correct: false, feedback: "Set Salary to £32,000 and above, then look for the job title Junior web developer. Type that employer. Ignore adverts that only promise a huge daily or weekly rate." };
    case "compare-two":
      return answers.length === 1 && answers[0] === "bramble"
        ? { correct: true, feedback: "Bramble Digital starts at £32,000 a year. Westford College IT starts at £26,500. Comparing the lower figure of a range keeps the comparison fair." }
        : { correct: false, feedback: "Open the compare page and read both yearly amounts. Use £32,000, the lower figure, for Bramble Digital, and compare it with the college salary." };
    case "essential-requirements":
      return answers.length === 1 && answers[0] === "personal-care"
        ? { correct: true, feedback: "Personal care is essential. A driving licence is only desirable, and the advert does not ask for a nursing degree or management experience." }
        : { correct: false, feedback: "Open the Willow Court Care advert and read the essential list separately from the desirable list. The driving licence is not in the essential list." };
    case "save-job":
      return saved.has("wfj-1070")
        ? { correct: true, feedback: "The Willow Court Care vacancy is saved on your account. You can close the advert and find it again under Saved jobs." }
        : { correct: false, feedback: "Open the Care assistant job at Willow Court Care and select Save job. If you are signed out, sign in and return to the same advert." };
    case "find-saved":
      if (!saved.has("wfj-1070")) {
        return { correct: false, feedback: "The Willow Court Care job is not in your saved list yet. Save it from the advert, open Saved jobs, then read the town." };
      }
      return normText(answer) === "leeds"
        ? { correct: true, feedback: "Saved jobs still shows Leeds. Saving a vacancy keeps the same advert, including the location." }
        : { correct: false, feedback: "Open Saved jobs and find Willow Court Care. Type the town written under the job title." };
    case "complete-application":
      return latestFor("wfj-1060")
        ? { correct: true, feedback: "Your practice application for The Salt Rooms has been recorded on your account. It has not been sent to the restaurant." }
        : { correct: false, feedback: "Open the Kitchen assistant job at The Salt Rooms, select Apply, complete every step and submit from the review page." };
    case "review-application": {
      const application = latestFor("wfj-1050");
      if (!application) {
        return { correct: false, feedback: "Submit a practice application for the Administrator job at Westford Community Centre. Use 07700 900184 and Westford, and read the review page before you submit." };
      }
      const phone = application.telephone.replace(/\D/g, "");
      const town = normText(application.town);
      if (phone.includes("7700900184") && town.includes("westford")) {
        return { correct: true, feedback: "The saved application shows 07700 900184 and Westford. Checking the review page is what catches a wrong number before you submit." };
      }
      return { correct: false, feedback: "An application was saved, but the telephone number or town does not match the practice details. Apply again, type 07700 900184 and Westford, and correct them on the review step before you submit." };
    }
    case "find-qualification":
      return answers.length === 1 && answers[0] === "level2"
        ? { correct: true, feedback: "The college asks for a Level 2 IT qualification or a year of paid IT support. The library IT job is a different advert and will consider people without that experience." }
        : { correct: false, feedback: "Open the IT support technician advert at Westford College IT and read the essential requirements. It names a level of IT qualification or a year of paid support work." };
    case "compare-conditions":
      return answers.length === 1 && answers[0] === "term-time"
        ? { correct: true, feedback: "Riverside Primary is term-time in Ealing. Willow Court Care in Leeds includes personal care and does not ask for a fee. Reading both sides avoids mixing the two jobs up." }
        : { correct: false, feedback: "Compare the two adverts again. Check the hours for term time, the essential list for personal care, and which town each job is in." };
    case "find-application":
      return applications.some((item) => referenceMatches(answer, item.reference))
        ? { correct: true, feedback: "That reference is on your account. Job adverts use WFJ- references. Your own application uses a different WJ- reference." }
        : { correct: false, feedback: "Open My applications and copy the reference that starts with WJ-. The WFJ- number on the job advert is the vacancy, not your application." };
    case "interview-invitation": {
      const application = latestFor("wfj-1040");
      if (!application || application.status !== "interview") {
        return { correct: false, feedback: "Submit a practice application for Customer service adviser at Hartfield Insurance, then open it in My applications. The practice status will be an interview invitation." };
      }
      return isHalfTen(answer)
        ? {
            correct: true,
            feedback: `The practice interview is at 10:30 on ${formatUkDate(interviewDate(application.submittedAt))}. The place and the reminder that nobody is expecting you are on the same invitation. This status was created by the practice website.`,
          }
        : { correct: false, feedback: "Open the Hartfield Insurance application and read the invitation. The start time is written next to the date. It is 10:30." };
    }
    case "spot-warning-signs": {
      const selected = new Set(answers);
      const right = selected.has("fee") && selected.has("pay") && selected.has("pressure") && !selected.has("address");
      return right
        ? { correct: true, feedback: "The advert asks for £149, promises £800 a day for simple forms, and tells you to decide tonight. It does not give an Ealing address or a landline. One of these signs is a reason to stop and check. It does not mean every short advert is fraudulent." }
        : { correct: false, feedback: "Read the QuickDesk advert again. Look for a fee, the size of the pay, and how quickly they want an answer. Do not select a company address unless the advert actually prints one." };
    }
    case "upfront-fee":
      return answers.length === 1 && answers[0] === "do-not-pay"
        ? { correct: true, feedback: "Being asked to pay £95 before any shift is allocated is a warning. Training itself can be genuine. High pay does not make an upfront fee safe, and a normal application form is not a warning on its own." }
        : { correct: false, feedback: "Look at what Instant Route Hire asks you to pay, and what they have not given you yet. A genuine employer does not usually charge you to begin. Training on its own is not proof of a scam." };
    case "entry-level":
      return answers.length === 1 && answers[0] === "salt-rooms"
        ? { correct: true, feedback: "The Salt Rooms advert says no previous paid employment is needed. The chef, HGV and personal assistant roles all ask for substantial experience. Entry level on the filter is a start, then you still read the requirements." }
        : { correct: false, feedback: "Open the Kitchen assistant advert at The Salt Rooms and read the essential requirements. Compare that sentence with the chef, HGV and personal assistant adverts." };
    case "multi-step":
      return saved.has("wfj-1062")
        ? { correct: true, feedback: "The breakfast assistant job is in Saved jobs. You combined a place, part-time hours and the hospitality category, then came back to the saved vacancy." }
        : { correct: false, feedback: "Search Bristol, set Part-time and Hospitality, open Breakfast assistant at Harbour and Clock Hotel, and select Save job. Then look in Saved jobs." };
    default:
      return { correct: false, feedback: "That practice task could not be checked." };
  }
}
