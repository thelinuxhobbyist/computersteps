import type { Vacancy } from "../../../workers/practice-bank/src/shared/jobs";

const SKILL_COURSES = [
  { id: "keyboard-skills", title: "Keyboard skills", categories: ["administration", "it", "finance", "customer-service", "education"] },
  { id: "email-messages", title: "Email & messages", categories: ["administration", "customer-service", "it"] },
  { id: "files-photos", title: "Files & photos", categories: ["it", "administration", "education"] },
  { id: "going-online", title: "Going online", categories: ["it", "customer-service", "retail"] },
  { id: "forms-shopping", title: "Forms & shopping", categories: ["retail", "finance", "administration"] },
  { id: "computer-basics", title: "Computer basics", categories: ["retail", "hospitality", "care", "cleaning", "warehouse"] },
] as const;

export type SkillCourse = { id: string; title: string; href: string };

export function coursesForJobs(jobs: Vacancy[]): SkillCourse[] {
  const categories = new Set(jobs.filter((job) => !job.suspicious).map((job) => job.category));
  return SKILL_COURSES.filter((course) => course.categories.some((category) => categories.has(category)))
    .slice(0, 3)
    .map((course) => ({ id: course.id, title: course.title, href: `/courses/${course.id}/` }));
}

export function coursesForJob(job: Vacancy): SkillCourse[] {
  if (job.suspicious) return [];
  return coursesForJobs([job]);
}
