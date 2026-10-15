import type { Metadata } from "next";
import { ExerciseList } from "../ExerciseViews";

export const metadata: Metadata = { title: "Guided exercises" };

export default function ExercisesPage() {
  return <ExerciseList />;
}
