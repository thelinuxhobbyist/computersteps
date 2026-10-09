import { DIFFICULTIES, type Difficulty, type Skill, type SkillProgress } from "../shared/exercise-types";
import type { Exercise, Facts } from "./types";
import { allHold, factNamesIn } from "./values";

export type HistoryItem = {
  exerciseId: string;
  status: "active" | "completed" | "skipped";
  success: boolean | null;
  attempts: number;
  helpUsed: boolean;
  startedAt: string;
};

/** Right first or second time, without a hint. */
export const isClean = (item: HistoryItem) => item.success === true && item.attempts <= 2 && !item.helpUsed;
const isFinished = (item: HistoryItem) => item.status !== "active";

export const PROMOTE_AFTER = 4;
export const RECENT_WINDOW = 6;

/**
 * Beginner until 4 beginner tasks have gone well, then developing until 4 developing tasks have.
 * Three struggles in a row step back one level for a while.
 */
export function learnerLevel(history: HistoryItem[], library: Exercise[]): Difficulty {
  const difficultyOf = new Map(library.map((exercise) => [exercise.id, exercise.difficulty]));
  const finished = history.filter(isFinished);
  const clean = (difficulty: Difficulty) => finished.filter((item) => isClean(item) && difficultyOf.get(item.exerciseId) === difficulty).length;

  let level = 0;
  if (clean("beginner") >= PROMOTE_AFTER) level = 1;
  if (level === 1 && clean("developing") >= PROMOTE_AFTER) level = 2;

  const lastThree = finished.slice(0, 3);
  if (level > 0 && lastThree.length === 3 && lastThree.every((item) => !isClean(item))) level -= 1;
  return DIFFICULTIES[level];
}

export function skillProgress(history: HistoryItem[], library: Exercise[]): SkillProgress[] {
  const skillsOf = new Map(library.map((exercise) => [exercise.id, exercise.skills]));
  const totals = new Map<Skill, SkillProgress>();
  for (const item of history.filter(isFinished)) {
    for (const skill of skillsOf.get(item.exerciseId) ?? []) {
      const entry = totals.get(skill) ?? { skill, tried: 0, succeeded: 0 };
      entry.tried += 1;
      if (isClean(item)) entry.succeeded += 1;
      totals.set(skill, entry);
    }
  }
  return [...totals.values()].sort((a, b) => b.tried - a.tried);
}

/**
 * The facts an exercise needs before it can be shown. Mistake values are optional, and an action's
 * success conditions often name facts that only exist once the learner has done it.
 */
export function requiredFacts(exercise: Exercise): string[] {
  const answer = exercise.answer.type === "action" ? {} : { ...exercise.answer, mistakes: undefined };
  return factNamesIn([exercise.instruction, exercise.question ?? "", answer]);
}

export function belongsTo(exercise: Exercise, environment: string): boolean {
  return exercise.site === environment || exercise.requiredSites.some((site) => site === environment);
}

export function isAvailable(exercise: Exercise, facts: Facts): boolean {
  if (exercise.active === false) return false;
  if (!allHold(exercise.requires, facts)) return false;
  return requiredFacts(exercise).every((name) => name in facts);
}

export type Ranked = { exercise: Exercise; score: number };

/** Higher scores are better suited to this learner right now. `history` is newest first. */
export function rankExercises(library: Exercise[], options: { environment: string; facts: Facts; history: HistoryItem[] }): Ranked[] {
  const { environment, facts, history } = options;
  const level = DIFFICULTIES.indexOf(learnerLevel(history, library));
  const recent = history.slice(0, RECENT_WINDOW).map((item) => item.exerciseId);
  const lastCategory = library.find((exercise) => exercise.id === history[0]?.exerciseId)?.category;
  const weakSkills = new Set(
    skillProgress(history, library)
      .filter((entry) => entry.tried >= 2 && entry.succeeded / entry.tried < 0.6)
      .map((entry) => entry.skill),
  );

  return library
    .filter((exercise) => belongsTo(exercise, environment) && isAvailable(exercise, facts))
    .map((exercise) => {
      const past = history.filter((item) => item.exerciseId === exercise.id && isFinished(item));
      let score = 100 + (exercise.priority ?? 0) * 5;

      if (past.length === 0) score += 60;
      else if (isClean(past[0])) score -= 80;
      // Struggled last time: worth another go, but not straight away (see `recent`).
      else score += 20;

      if (recent.includes(exercise.id)) score -= 200;

      const distance = DIFFICULTIES.indexOf(exercise.difficulty) - level;
      score += distance === 0 ? 40 : distance === -1 ? 5 : distance === 1 ? -25 : -70;

      score += Math.min(2, exercise.skills.filter((skill) => weakSkills.has(skill)).length) * 12;
      if (exercise.category === lastCategory) score -= 15;

      return { exercise, score };
    })
    .sort((a, b) => b.score - a.score);
}

/** Picks at random among the best few, so two learners at the same stage do not get identical sessions. */
export function chooseNext(ranked: Ranked[], random: () => number): Exercise | null {
  if (ranked.length === 0) return null;
  const best = ranked[0].score;
  const shortlist = ranked.filter((item) => item.score >= best - 30).slice(0, 5);
  return shortlist[Math.floor(random() * shortlist.length)].exercise;
}
