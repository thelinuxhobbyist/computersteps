import { lessons } from "./content";
import type { Lesson } from "./types";

export type CourseGroup = {
  id: string;
  title: string;
  description: string;
  number: string;
  accent: string;
  items: readonly string[];
};

export const HOME_FEATURED_COURSE_COUNT = 3;

export const courseGroups: CourseGroup[] = [
  {
    id: "computer-basics",
    title: "Computer basics",
    description: "Learn to click, double-click, drag and drop.",
    number: "1",
    accent: "#0f766e",
    items: ["computer", "mouse", "put-in-place"],
  },
  {
    id: "keyboard-skills",
    title: "Keyboard skills",
    description: "Learn to type letters, numbers and UK keyboard symbols.",
    number: "2",
    accent: "#0d9488",
    items: ["keyboard", "characters"],
  },
  {
    id: "going-online",
    title: "Going online",
    description: "Use websites, search the internet and stay safe.",
    number: "3",
    accent: "#3b82f6",
    items: ["internet", "safety", "passwords"],
  },
  {
    id: "email-messages",
    title: "Email & messages",
    description: "Read, write and send email. Share files with people.",
    number: "4",
    accent: "#8b5cf6",
    items: ["email", "attachments", "email-advanced"],
  },
  {
    id: "files-photos",
    title: "Files & photos",
    description: "Open, move, upload and organise files and pictures.",
    number: "5",
    accent: "#d97706",
    items: ["files", "photos"],
  },
  {
    id: "forms-shopping",
    title: "Forms & shopping",
    description: "Fill in forms online and practise shopping on websites.",
    number: "6",
    accent: "#ea580c",
    items: ["forms", "shopping"],
  },
  {
    id: "play-learn",
    title: "Play & learn",
    description: "Practise the same skills through games, pets and parties.",
    number: "7",
    accent: "#db2777",
    items: ["playground", "birthday", "petshop", "toyroom", "garden", "rainyday"],
  },
];

const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function getLesson(lessonId: string): Lesson | undefined {
  return lessonMap.get(lessonId);
}

export function getCourse(courseId: string): CourseGroup | undefined {
  return courseGroups.find((course) => course.id === courseId);
}

export function getCourseForLesson(lessonId: string): CourseGroup | undefined {
  return courseGroups.find((course) => course.items.includes(lessonId));
}

export function getCourseLessons(course: CourseGroup): Lesson[] {
  return course.items
    .map((lessonId) => lessonMap.get(lessonId))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

export function getCourseLessonCount(course: CourseGroup): number {
  return getCourseLessons(course).reduce((sum, lesson) => sum + lesson.steps.length, 0);
}

export function getFeaturedCourses(count = HOME_FEATURED_COURSE_COUNT): CourseGroup[] {
  return [...courseGroups].reverse().slice(0, count);
}

export function getNextLessonInCourse(lessonId: string): Lesson | null {
  const course = getCourseForLesson(lessonId);
  if (!course) return null;

  const lessonIndex = course.items.indexOf(lessonId);
  if (lessonIndex < 0 || lessonIndex >= course.items.length - 1) return null;

  return getLesson(course.items[lessonIndex + 1]) ?? null;
}

export function isLastLessonInCourse(lessonId: string): boolean {
  const course = getCourseForLesson(lessonId);
  if (!course) return false;

  return course.items[course.items.length - 1] === lessonId;
}

export function getNextCourse(currentCourseId: string): CourseGroup | null {
  const courseIndex = courseGroups.findIndex((course) => course.id === currentCourseId);
  if (courseIndex < 0 || courseIndex >= courseGroups.length - 1) return null;

  return courseGroups[courseIndex + 1];
}

export function getFirstLessonInCourse(courseId: string): Lesson | null {
  const course = getCourse(courseId);
  if (!course || course.items.length === 0) return null;

  return getLesson(course.items[0]) ?? null;
}
