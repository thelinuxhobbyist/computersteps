// The shapes the exercise API sends to the website. The full exercise definitions,
// including answers, stay in the Worker.

export type Difficulty = "beginner" | "developing" | "confident";

export const DIFFICULTIES: Difficulty[] = ["beginner", "developing", "confident"];

export type Skill =
  | "navigation"
  | "finding_information"
  | "reading"
  | "numeracy"
  | "dates"
  | "decision_making"
  | "forms"
  | "payments"
  | "search"
  | "help_support"
  | "online_safety"
  | "cross_site_navigation";

export const SKILL_LABELS: Record<Skill, string> = {
  navigation: "Finding your way around",
  finding_information: "Finding information",
  reading: "Reading and understanding",
  numeracy: "Working with numbers",
  dates: "Dates",
  decision_making: "Making decisions",
  forms: "Filling in forms",
  payments: "Payments",
  search: "Searching",
  help_support: "Getting help",
  online_safety: "Staying safe online",
  cross_site_navigation: "Using more than one website",
};

export type Category =
  | "finding_information"
  | "navigation"
  | "reading_bills"
  | "numeracy"
  | "payments"
  | "problem_solving"
  | "cross_site";

export const CATEGORY_LABELS: Record<Category, string> = {
  finding_information: "Finding information",
  navigation: "Website navigation",
  reading_bills: "Reading bills",
  numeracy: "Numbers",
  payments: "Payments",
  problem_solving: "Problem-solving",
  cross_site: "Using more than one website",
};

/** How the learner gives their answer. New types need a checker in the Worker and an input in the task panel. */
export type AnswerType = "number" | "text" | "date" | "choice" | "yes_no" | "action" | "navigation";

export type TaskOption = { id: string; label: string };

export type LearnerTask = {
  attemptId: number;
  exerciseId: string;
  environment: string;
  title: string;
  instruction: string;
  question: string | null;
  answerType: AnswerType;
  options: TaskOption[] | null;
  multiple: boolean;
  /** Shown next to number boxes, for example "£" or "kWh". */
  unit: { before?: string; after?: string } | null;
  sites: { id: string; name: string }[];
  status: "active" | "completed" | "skipped";
  attempts: number;
  hint: string | null;
  startedBy: "tutor" | "learner";
  startedAt: string;
};

export type AnswerResult = { correct: boolean; feedback: string; task: LearnerTask };

export type AttemptSummary = {
  attemptId: number;
  exerciseId: string;
  title: string;
  difficulty: Difficulty;
  status: "active" | "completed" | "skipped";
  success: boolean | null;
  attempts: number;
  helpUsed: boolean;
  startedAt: string;
  completedAt: string | null;
};

export type ExerciseListing = {
  id: string;
  title: string;
  instruction: string;
  category: Category;
  difficulty: Difficulty;
  skills: Skill[];
  answerType: AnswerType;
  sites: string[];
  available: boolean;
  timesDone: number;
  lastSuccess: boolean | null;
};

export type SkillProgress = { skill: Skill; tried: number; succeeded: number };

export type LearnerSummary = {
  username: string;
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  level: Difficulty;
  current: LearnerTask | null;
  recommended: ExerciseListing | null;
  recent: AttemptSummary[];
  skills: SkillProgress[];
  completedCount: number;
  exercises: ExerciseListing[];
};

export type LearnerListItem = { username: string; fullName: string; lastUsedAt: string; currentTitle: string | null };
