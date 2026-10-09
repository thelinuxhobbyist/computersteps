import type { Exercise } from "../types";
import { ENERGY_EXERCISES } from "./energy";

// Add Bank, Shop, GP and future libraries here. Ids must stay the same once learners have used them,
// because progress is stored against them.
export const EXERCISES: Exercise[] = [...ENERGY_EXERCISES];

const byId = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id);
}

/** The websites a tutor can choose as the starting point for a session. */
export function environments(): string[] {
  return [...new Set(EXERCISES.map((exercise) => exercise.site))];
}
