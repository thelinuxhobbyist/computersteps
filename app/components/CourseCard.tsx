import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBook, faListCheck } from "@fortawesome/free-solid-svg-icons";
import type { CSSProperties } from "react";
import type { CourseGroup } from "../lessons/courses";
import { getCourseLessonCount, getCourseLessons } from "../lessons/courses";

type CourseCardProps = {
  course: CourseGroup;
};

export default function CourseCard({ course }: CourseCardProps) {
  const courseLessons = getCourseLessons(course);
  const stepCount = getCourseLessonCount(course);
  const lessonLabel = courseLessons.length === 1 ? "lesson" : "lessons";

  return (
    <article
      className={`course-card course-card--${course.id}`}
      style={{ "--course-accent": course.accent } as CSSProperties}
    >
      <div className="course-card__meta">
        <span>
          <FontAwesomeIcon icon={faBook} aria-hidden="true" />
          {courseLessons.length} {lessonLabel}
        </span>
        <span>
          <FontAwesomeIcon icon={faListCheck} aria-hidden="true" />
          {stepCount} steps
        </span>
      </div>

      <h3 className="course-card__title">{course.title}</h3>

      <div className="course-card__tags" aria-label={`Lessons in ${course.title}`}>
        {courseLessons.map((lesson) => (
          <span key={lesson.id}>{lesson.title}</span>
        ))}
      </div>

      <Link href={`/courses/${course.id}/`} className="course-card__link">
        Open course
        <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
      </Link>
    </article>
  );
}
