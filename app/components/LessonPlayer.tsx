"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ExercisePanel from "./ExercisePanel";
import { getNextLessonInCourse, getCourseForLesson } from "../lessons/courses";
import { lessons } from "../lessons/content";
import type { Lesson } from "../lessons/types";

type LessonPlayerProps = {
  lesson: Lesson;
  lessonIndex: number;
  onBack: () => void;
  onStartLesson: (index: number) => void;
};

export default function LessonPlayer({ lesson, lessonIndex, onBack, onStartLesson }: LessonPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const currentStep = lesson.steps[stepIndex];
  const lessonLength = lesson.steps.length;
  const progressPercent = lessonComplete ? 100 : ((stepIndex + 1) / lessonLength) * 100;
  const course = getCourseForLesson(lesson.id);
  const nextLesson = getNextLessonInCourse(lesson.id);
  const backHref = course ? `/courses/${course.id}/` : "/";
  const backLabel = course ? `Back to ${course.title}` : "Back to home";

  const resetStep = () => {
    setStepComplete(false);
    setFeedback(null);
    setHelpOpen(false);
  };

  const handleSuccess = () => {
    setStepComplete(true);
    setFeedback("success");
  };

  const handleError = () => {
    setStepComplete(false);
    setFeedback("error");
    window.setTimeout(() => setFeedback(null), 1200);
  };

  const goToPreviousStep = () => {
    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
      resetStep();
      return;
    }
    onBack();
  };

  const goToNextStep = () => {
    if (!stepComplete) return;

    resetStep();

    if (stepIndex >= lessonLength - 1) {
      setLessonComplete(true);
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const startNextLesson = () => {
    if (nextLesson) {
      const nextIndex = lessons.findIndex((item) => item.id === nextLesson.id);
      if (nextIndex >= 0) {
        onStartLesson(nextIndex);
      }
    }
  };

  if (lessonComplete) {
    return (
      <div className="lesson-main wrap">
        <div className="step-card lesson-complete-card">
          <div className="icon" aria-hidden="true">🎉</div>
          <h2>Lesson complete!</h2>
          <p>
            Well done. You completed this lesson.
          </p>

          {nextLesson ? (
            <div className="completion-next">
              <p className="completion-label">Continue learning</p>
              <h3>Next lesson: {nextLesson.title}</h3>
              <p className="completion-desc">{nextLesson.description}</p>
              <button type="button" onClick={startNextLesson} className="btn btn-primary">
                Start next lesson <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          ) : (
            <p className="completion-desc">You have finished all available lessons. Great work!</p>
          )}

          <button type="button" onClick={onBack} className="btn btn-outline completion-back">
            {backLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-main wrap">
      <div className="lesson-header">
        <button type="button" onClick={onBack} className="back-link">
          <FontAwesomeIcon icon={faArrowRight} rotation={180} />
          {backLabel}
        </button>

        <div className="lesson-header-top">
          <div>
            <p className="lesson-tag">{lesson.title}</p>
            <h1>Step {stepIndex + 1}</h1>
          </div>

          <button
            type="button"
            onClick={() => setHelpOpen((current) => !current)}
            className="btn help-btn btn-sm"
            aria-expanded={helpOpen}
          >
            Need help?
          </button>
        </div>

        <div className="progress-track" aria-label="Lesson progress">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className={`help-panel ${helpOpen ? "open" : ""}`}>
          <p>{currentStep.hint}</p>
        </div>
      </div>

      <div className="step-card">
        <h2>{currentStep.instruction}</h2>

        <div className="practice-area">
          <ExercisePanel
            key={`${lesson.id}-${currentStep.id}-${stepIndex}`}
            step={currentStep}
            stepComplete={stepComplete}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {feedback === "success" && (
          <p className="feedback-inline" role="status" aria-live="polite">
            Correct!
          </p>
        )}

        {feedback === "error" && (
          <p className="feedback-inline feedback-inline-error" role="status" aria-live="polite">
            Not quite. Try again.
          </p>
        )}

        <div className="step-footer">
          <div className="step-nav-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={goToPreviousStep}>
              Previous
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={goToNextStep}
              disabled={!stepComplete}
              aria-disabled={!stepComplete}
            >
              {stepIndex >= lessonLength - 1 ? "Finish lesson" : "Next step"}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
