"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import CourseCard from "./components/CourseCard";
import LessonPlayer from "./components/LessonPlayer";
import SiteHeader from "./components/SiteHeader";
import { getFeaturedCourses, courseGroups, getCourseForLesson } from "./lessons/courses";
import { lessons } from "./lessons/content";

function HomeContent() {
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCourseId = searchParams.get("course");
  const requestedLessonIndex = requestedCourseId ? lessons.findIndex((lesson) => lesson.id === requestedCourseId) : -1;
  const visibleLessonIndex = requestedLessonIndex >= 0 ? requestedLessonIndex : activeLessonIndex;
  const featuredCourses = getFeaturedCourses();

  const startLesson = (index: number) => {
    setActiveLessonIndex(index);
    router.push(`/?course=${lessons[index].id}`);
  };

  const goHome = () => {
    setActiveLessonIndex(null);
    router.push("/");
  };

  const goBackFromLesson = () => {
    const lessonIndex = visibleLessonIndex;
    if (lessonIndex !== null && lessonIndex >= 0) {
      const course = getCourseForLesson(lessons[lessonIndex].id);
      setActiveLessonIndex(null);
      if (course) {
        router.push(`/courses/${course.id}/`);
        return;
      }
    }
    goHome();
  };

  return (
    <div className={`site ${visibleLessonIndex !== null && visibleLessonIndex >= 0 ? "site--in-lesson" : ""}`}>
      <SiteHeader />

      {visibleLessonIndex !== null && visibleLessonIndex >= 0 ? (
        <LessonPlayer
          key={visibleLessonIndex}
          lesson={lessons[visibleLessonIndex]}
          lessonIndex={visibleLessonIndex}
          onBack={goBackFromLesson}
          onStartLesson={startLesson}
        />
      ) : (
        <>
          <section className="hero wrap">
            <h1>Learn by doing, one step at a time.</h1>
            <p className="hero-lead">
              Practise clicking, typing, browsing, files and email — with patient guidance at every step.
            </p>
            <div className="hero-actions">
              <Link href="/courses/computer-basics/" className="btn btn-primary">
                Start with the basics
              </Link>
              <Link href="/courses/" className="btn btn-outline">
                See all courses
              </Link>
            </div>
          </section>

          <section className="section wrap" id="courses">
            <div className="section-head">
              <h2>Popular courses</h2>
              <p>Three courses to get you started. Open one to see its lessons.</p>
            </div>

            <div className="course-grid course-grid--featured">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="section-foot">
              <Link href="/courses/" className="btn btn-outline">
                Browse all {courseGroups.length} courses <FontAwesomeIcon icon={faArrowRight} className="text-[0.85em]" />
              </Link>
            </div>
          </section>

          <section className="section section-muted" id="how-it-works">
            <div className="wrap">
              <div className="section-head">
                <h2>How it works</h2>
                <p>No account needed. Open a course, pick a lesson, read the instruction, try the task, and move on when you are ready.</p>
              </div>

              <ol className="how-list">
                <li>
                  <strong>Pick a course</strong>
                  <span>Each course covers one area, like email or staying safe online.</span>
                </li>
                <li>
                  <strong>Try it yourself</strong>
                  <span>Practise clicking, typing or navigating in a safe space.</span>
                </li>
                <li>
                  <strong>Move on when ready</strong>
                  <span>When you get it right, press Next. There is no rush.</span>
                </li>
              </ol>
            </div>
          </section>

          <section className="section wrap" id="about">
            <div className="about-panel">
              <h2>Built for learners, not experts</h2>
              <p>
                Computer Steps is designed for people who are new to computers, learning in a library, studying English, or building confidence one small action at a time. It is free, simple, and focused on practice — not sales or scores.
              </p>
            </div>
          </section>
        </>
      )}

      {visibleLessonIndex === null || visibleLessonIndex < 0 ? (
        <footer>
          <div className="wrap footer-inner">
            <span suppressHydrationWarning>© {new Date().getFullYear()} Computer Steps</span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="site"><main className="wrap" style={{ paddingTop: "32px" }}>Loading…</main></div>}>
      <HomeContent />
    </Suspense>
  );
}
