"use client";

import { useMemo, useSyncExternalStore } from "react";
import { EMPTY_DRAFT, type ApplicationDraft, type CvChoice } from "../../../workers/practice-bank/src/shared/job-application";
import { SAMPLE_CV_FILE_NAME, cvFileError } from "../../../workers/practice-bank/src/shared/practice-profile";

const COMPARE_KEY = "westford-jobs-compare";
const TASK_KEY = "westford-jobs-task";
const DRAFT_PREFIX = "westford-jobs-draft:";
const COMPARE_EVENT = "westford-jobs-compare";
const TASK_EVENT = "westford-jobs-task";
const DRAFT_EVENT = "westford-jobs-draft";

function listen(eventName: string) {
  return (onChange: () => void) => {
    window.addEventListener(eventName, onChange);
    return () => window.removeEventListener(eventName, onChange);
  };
}

const subscribeCompare = listen(COMPARE_EVENT);
const subscribeTask = listen(TASK_EVENT);
const subscribeDraft = listen(DRAFT_EVENT);

function readStorage(key: string): string {
  try {
    return window.sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function safeJobsPath(value: string | null): string | null {
  if (!value || !value.startsWith("/scenarios/jobs/") || value.includes("://") || value.includes("\\")) return null;
  return value;
}

function parseCompare(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, 2);
  } catch {
    return [];
  }
}

export function readCompare(): string[] {
  return parseCompare(readStorage(COMPARE_KEY));
}

export function writeCompare(ids: string[]) {
  try {
    window.sessionStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, 2)));
  } catch {
    // The comparison still updates on this page if storage is blocked.
  }
  window.dispatchEvent(new Event(COMPARE_EVENT));
}

export function useCompareIds(): string[] {
  const raw = useSyncExternalStore(subscribeCompare, () => readStorage(COMPARE_KEY), () => "");
  return useMemo(() => parseCompare(raw), [raw]);
}

export function rememberTask(id: string) {
  try {
    window.sessionStorage.setItem(TASK_KEY, id);
  } catch {
    // The task page remains available from Guided exercises.
  }
  window.dispatchEvent(new Event(TASK_EVENT));
}

export function clearTask() {
  try {
    window.sessionStorage.removeItem(TASK_KEY);
  } catch {
    // Nothing else to clear.
  }
  window.dispatchEvent(new Event(TASK_EVENT));
}

export function useRememberedTask(): string {
  return useSyncExternalStore(subscribeTask, () => readStorage(TASK_KEY), () => "");
}

export function draftKey(jobId: string) {
  return `${DRAFT_PREFIX}${jobId}`;
}

export function clearDraft(jobId: string) {
  try {
    window.sessionStorage.removeItem(draftKey(jobId));
  } catch {
    // The confirmation page does not need the draft.
  }
  window.dispatchEvent(new Event(DRAFT_EVENT));
}

function cvStorageKey(username: string) {
  return `westford-jobs-cv:${username.trim().toLowerCase()}`;
}

/** The CV chosen on this device. The sample CV is used until the learner uploads another file. */
export function readSavedCv(username: string): { choice: CvChoice; fileName: string } {
  const sample = { choice: "sample" as const, fileName: SAMPLE_CV_FILE_NAME };
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(cvStorageKey(username)) ?? "");
    if (!parsed || typeof parsed !== "object") return sample;
    const choice = (parsed as { choice?: unknown }).choice;
    const fileName = (parsed as { fileName?: unknown }).fileName;
    if (choice === "upload" && typeof fileName === "string" && !cvFileError(fileName)) {
      return { choice: "upload", fileName };
    }
  } catch {
    // A missing or blocked store just means the sample CV is still attached.
  }
  return sample;
}

export function writeSavedCv(username: string, choice: "sample" | "upload", fileName: string) {
  try {
    window.localStorage.setItem(cvStorageKey(username), JSON.stringify({ choice, fileName }));
  } catch {
    // The choice still applies to this application.
  }
}

export function useJobDraft(jobId: string): [ApplicationDraft, (patch: Partial<ApplicationDraft>) => void] {
  const raw = useSyncExternalStore(subscribeDraft, () => readStorage(draftKey(jobId)), () => "");
  const draft = useMemo(() => {
    if (!raw) return EMPTY_DRAFT;
    try {
      return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<ApplicationDraft>) };
    } catch {
      return EMPTY_DRAFT;
    }
  }, [raw]);

  const update = (patch: Partial<ApplicationDraft>) => {
    const next = { ...draft, ...patch };
    try {
      window.sessionStorage.setItem(draftKey(jobId), JSON.stringify(next));
    } catch {
      // The form still works for this visit.
    }
    window.dispatchEvent(new Event(DRAFT_EVENT));
  };

  return [draft, update];
}
