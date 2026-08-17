import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SiteHeader from "../../components/SiteHeader";
import { courseGroups, getCourse, getCourseLessons } from "../../lessons/courses";

type CoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export function generateStaticParams() {
  return courseGroups.map((course) => ({ courseId: course.id }));
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    notFound();
  }

  const courseLessons = getCourseLessons(course);

  return (
    <div className="site">
      <SiteHeader />

      <main className="wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/courses/">Courses</Link>
          <span aria-hidden="true">/</span>
          <span>{course.title}</span>
        </nav>

        <section className="course-hero" style={{ "--course-accent": course.accent } as CSSProperties}>
          <span className="course-hero__badge">{course.number}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <p className="course-hero__meta">
            {courseLessons.length} {courseLessons.length === 1 ? "lesson" : "lessons"} in this course
          </p>
        </section>

        <section className="section course-lessons-section" aria-labelledby="course-lessons-heading">
          <div className="section-head">
            <h2 id="course-lessons-heading">Lessons in this course</h2>
            <p>Pick a lesson. You can do them in order, or choose the one you want.</p>
          </div>

          <div className="lesson-grid lesson-grid--course">
            {courseLessons.map((lesson, index) => (
              <article
                key={lesson.id}
                className="lesson-card lesson-card--course"
                style={{ borderTopColor: course.accent }}
              >
                <div className="lesson-top">
                  <span className="lesson-icon c-purple">
                    <FontAwesomeIcon icon={lesson.icon} />
                  </span>
                  <span className="step-count">Lesson {index + 1} · {lesson.steps.length} steps</span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <Link href={`/?course=${lesson.id}`} className="btn btn-primary btn-sm lesson-card__start">
                  Start lesson →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="course-detail-nav">
          <Link href="/courses/" className="btn btn-outline">
            ← All courses
          </Link>
        </div>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
