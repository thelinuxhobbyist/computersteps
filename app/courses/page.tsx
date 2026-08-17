import Link from "next/link";
import CourseCard from "../components/CourseCard";
import SiteHeader from "../components/SiteHeader";
import { courseGroups } from "../lessons/courses";

export default function CoursesPage() {
  return (
    <div className="site">
      <SiteHeader />

      <main className="wrap">
        <section className="hero" aria-labelledby="courses-heading">
          <h1 id="courses-heading">All courses</h1>
          <p className="hero-lead">
            Pick a course first. Each course has a small set of lessons that build on each other.
          </p>
        </section>

        <div className="course-banner" role="note">
          <div className="course-banner__icon" aria-hidden="true">
            👋
          </div>
          <div className="course-banner__text">
            <h2>New to computers?</h2>
            <p>Start with Computer basics. It teaches clicking and using the mouse.</p>
          </div>
          <Link href="/courses/computer-basics/" className="btn btn-primary">
            Start here →
          </Link>
        </div>

        <section className="section" aria-labelledby="all-courses-heading">
          <div className="section-head">
            <h2 id="all-courses-heading">Choose a course</h2>
            <p>Open a course to see its lessons. You do not need to finish every course — pick what helps you.</p>
          </div>

          <div className="course-grid">
            {courseGroups.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span>© {new Date().getFullYear()} Computer Steps</span>
        </div>
      </footer>
    </div>
  );
}
