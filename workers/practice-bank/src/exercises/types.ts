import type { AnswerType, Category, Difficulty, Skill } from "../shared/exercise-types";
import type { SiteId } from "../shared/sites";

/**
 * A fact is one thing that is true about the learner's fictional world right now,
 * like "energy.bill.amount" or "bank.balance". Exercises are written against facts,
 * so the same exercise works for every learner and keeps working after they pay a bill.
 */
export type FactValue =
  | { kind: "money"; pence: number }
  | { kind: "number"; value: number; unit?: string }
  | { kind: "date"; day: string }
  | { kind: "text"; value: string }
  | { kind: "bool"; value: boolean };

export type Facts = Record<string, FactValue>;

/** A literal (money in pence), a fact, or simple sums. */
export type ValueRef =
  | number
  | string
  | boolean
  | { fact: string }
  | { add: ValueRef[] }
  | { sub: [ValueRef, ...ValueRef[]] }
  | { mul: [ValueRef, ValueRef] }
  | { div: [ValueRef, ValueRef] };

/** True when the fact compares as described. Every listed comparison must hold. */
export type Condition = {
  fact: string;
  equals?: ValueRef;
  notEquals?: ValueRef;
  atLeast?: ValueRef;
  atMost?: ValueRef;
};

export type Mistake = { value: ValueRef; feedback: string };

export type NumberUnit = "money" | "kWh" | "pence" | "days" | "count" | "reading";

/** answer_type + answer_data + success_condition in one place. */
export type AnswerSpec =
  | {
      type: "number";
      value: ValueRef;
      unit: NumberUnit;
      /** Other numbers that also count as right, like 0.25 for "25p". */
      alsoAccept?: ValueRef[];
      tolerance?: number;
      mistakes?: Mistake[];
    }
  | {
      type: "text";
      accept: ValueRef[];
      /** words: same letters and numbers; digits: same numbers only; contains: the answer includes it. */
      compare: "words" | "digits" | "contains";
      mistakes?: Mistake[];
    }
  | { type: "date"; value: ValueRef; mistakes?: Mistake[] }
  | {
      type: "choice";
      options: { id: string; label: string }[];
      /** Option ids, or a text fact holding comma-separated option ids. */
      correct: string[] | { fact: string };
      multiple?: boolean;
      mistakes?: { option: string; feedback: string }[];
    }
  | { type: "yes_no"; correct: boolean | { fact: string } | { when: Condition[] } }
  | { type: "action"; success: Condition[] }
  | { type: "navigation"; pages: string[] };

export type Exercise = {
  id: string;
  /** The website the exercise belongs to. */
  site: SiteId;
  /** Every website the learner must use, including `site`. */
  requiredSites: readonly SiteId[];
  category: Category;
  /** Short, for tutors. */
  title: string;
  /** What the learner reads. "{person.firstName}" and other facts are filled in. */
  instruction: string;
  /** The question beside the answer box, when it helps to repeat it. */
  question?: string;
  difficulty: Difficulty;
  skills: Skill[];
  answer: AnswerSpec;
  /** Something must also be true before an answer counts, like "the bill has been paid". */
  alsoRequired?: { conditions: Condition[]; feedback: string };
  /** Shown after a wrong answer. A nudge, never the answer. */
  feedback: string;
  /** Shown only when the learner asks for help. Says where to look, not what to type. */
  hint: string;
  /** Only offered when these are true, like "there is an unpaid bill". */
  requires?: Condition[];
  /** Higher is offered sooner, all else being equal. */
  priority?: number;
  active?: boolean;
};

export type { AnswerType };
