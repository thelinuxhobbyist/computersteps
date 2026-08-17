import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type StepType =
  | "click"
  | "doubleClick"
  | "selectFile"
  | "deleteFile"
  | "openFolder"
  | "dragDrop"
  | "scroll"
  | "typeText"
  | "deleteText"
  | "pressEnter"
  | "openBrowser"
  | "browserAddress"
  | "searchInternet"
  | "clickLink"
  | "browserBack"
  | "browserForward"
  | "downloadAttachment"
  | "openInbox"
  | "openEmail"
  | "backToInbox"
  | "replyEmail"
  | "composeEmail"
  | "uploadFile";

export type LessonStep = {
  id: string;
  type: StepType;
  instruction: string;
  instructionLines?: string[];
  hint: string;
  expected?: string;
  target?: string;
  buttonLabel?: string;
  options?: string[];
  dragItem?: string;
  dropLabel?: string;
  searchQuery?: string;
  linkLabel?: string;
  pageTitle?: string;
  emailFrom?: string;
  emailSubject?: string;
  emailBody?: string;
  composeTo?: string;
  composeSubject?: string;
  composeBody?: string;
  composeStart?: "new" | "direct";
  expectedTo?: string;
  expectedSubject?: string;
  requireAttachment?: boolean;
  scrollTarget?: string;
  theme?: "balloon" | "gift" | "star" | "playground" | "treasure";
  themeColor?: string;
  themeEmoji?: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  icon: IconDefinition;
  steps: LessonStep[];
};
