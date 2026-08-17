import {
  faCartShopping,
  faBoxOpen,
  faCakeCandles,
  faCloudRain,
  faComputerMouse,
  faEnvelope,
  faFolder,
  faGamepad,
  faGlobe,
  faHandPointer,
  faImage,
  faKeyboard,
  faKey,
  faPaperclip,
  faPaw,
  faPenToSquare,
  faSeedling,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import type { Lesson, LessonStep } from "./types";
import { DEFAULT_INBOX_IDS, ADVANCED_INBOX_IDS, getContact } from "./email-data";

function keyHelpForText(text: string): string {
  const specialCharacterMap: Record<string, string> = {
    ",": "Press the comma key.",
    ".": "Press the full stop key.",
    "?": "Hold Shift. Press /.",
    "!": "Hold Shift. Press 1.",
    "@": "Hold Shift. Press the apostrophe key.",
    "/": "Press /.",
    "#": "Press #.",
    "-": "Press -.",
    _: "Hold Shift. Press -.",
    ":": "Hold Shift. Press ;.",
    "'": "Press the apostrophe key.",
    '"': "Hold Shift. Press 2.",
    "%": "Hold Shift. Press 5.",
    "£": "Hold Shift. Press 3.",
    "$": "Hold Shift. Press 4.",
    "&": "Hold Shift. Press 7.",
    " ": "Press the space bar.",
  };

  const uniqueSpecialCharacters = [...new Set([...text].filter((character) => /[^A-Za-z0-9\s]/.test(character)))];
  if (uniqueSpecialCharacters.length === 0) return "";

  return uniqueSpecialCharacters
    .map((character) => specialCharacterMap[character] ?? `Press the ${character} key.`)
    .join(" ");
}

function lines(...parts: string[]) {
  const instructionLines = parts.filter(Boolean);
  return {
    instruction: instructionLines.join(" "),
    instructionLines,
  };
}

function clickStep(id: string, label: string, instructionLines?: string | string[]): LessonStep {
  const normalized = typeof instructionLines === "string"
    ? [instructionLines]
    : instructionLines;

  return {
    id,
    type: "click",
    ...lines(...(normalized ?? [`Click ${label}.`])),
    buttonLabel: label,
    hint: `Click ${label}.`,
  };
}

function doubleClickStep(id: string, label: string): LessonStep {
  return {
    id,
    type: "doubleClick",
    ...lines(`Click ${label}.`, "Click again."),
    buttonLabel: label,
    hint: `Click ${label} two times.`,
  };
}

function selectFileStep(id: string, fileName: string, options: string[]): LessonStep {
  return {
    id,
    type: "selectFile",
    ...lines(`Find ${fileName}.`, "Click it."),
    expected: fileName,
    options,
    hint: `Find ${fileName}. Click it.`,
  };
}

function deleteFileStep(id: string, fileName: string, options: string[]): LessonStep {
  return {
    id,
    type: "deleteFile",
    ...lines(`Find ${fileName}.`, "Click delete."),
    expected: fileName,
    options,
    hint: `Find ${fileName}. Click delete.`,
  };
}

function openFolderStep(id: string, folderName: string, options: string[]): LessonStep {
  return {
    id,
    type: "openFolder",
    ...lines(`Find ${folderName}.`, "Click it."),
    expected: folderName,
    options,
    hint: `Find ${folderName}. Click it.`,
  };
}

function dragDropStep(id: string, item: string, dropLabel: string): LessonStep {
  return {
    id,
    type: "dragDrop",
    ...lines(`Pick up ${item}.`, `Drop in ${dropLabel}.`),
    dragItem: item,
    dropLabel,
    expected: item,
    hint: `Drag ${item} to ${dropLabel}.`,
  };
}

function scrollStep(id: string, target: string): LessonStep {
  return {
    id,
    type: "scroll",
    ...lines("Scroll down.", `Find ${target}.`),
    scrollTarget: target,
    expected: target,
    hint: `Scroll down. Find ${target}.`,
  };
}

function typeStep(id: string, word: string, instructionLines?: string | string[]): LessonStep {
  const normalized = typeof instructionLines === "string"
    ? [instructionLines]
    : instructionLines;

  const defaultLine = word.includes(" ")
    ? `Type ${word}.`
    : (keyHelpForText(word) || `Type ${word}.`);

  return {
    id,
    type: "typeText",
    ...lines(...(normalized ?? [defaultLine])),
    expected: word,
    hint: `Type ${word}. ${keyHelpForText(word)}`.trim(),
  };
}

function wordCasePairSteps(idPrefix: string, startId: number, words: string[]): LessonStep[] {
  const steps: LessonStep[] = [];
  let id = startId;

  for (const word of words) {
    const lower = word.toLowerCase();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);

    steps.push(typeStep(`${idPrefix}${id++}`, lower));
    if (capitalized !== lower) {
      steps.push(typeStep(`${idPrefix}${id++}`, capitalized));
    }
  }

  return steps;
}

function deleteTextStep(id: string, start: string, expected: string): LessonStep {
  return {
    id,
    type: "deleteText",
    ...lines("Use Backspace.", `Stop when you see ${expected}.`),
    expected,
    target: start,
    hint: "Use Backspace.",
  };
}

function enterStep(id: string, word: string): LessonStep {
  return {
    id,
    type: "pressEnter",
    ...lines(`Type ${word}.`, "Press Enter."),
    expected: word,
    hint: `Type ${word}. Press Enter.`,
  };
}

function browserOpenStep(id: string): LessonStep {
  return {
    id,
    type: "openBrowser",
    ...lines("Click Open browser."),
    hint: "Open the browser.",
  };
}

function addressStep(id: string, address: string): LessonStep {
  return {
    id,
    type: "browserAddress",
    ...lines(`Type ${address}.`),
    expected: address,
    hint: `Type ${address}.`,
  };
}

function searchStep(id: string, query: string): LessonStep {
  return {
    id,
    type: "searchInternet",
    ...lines(`Type ${query}.`, "Click Search."),
    searchQuery: query,
    expected: query,
    hint: `Type ${query}. Click Search.`,
  };
}

function linkStep(id: string, label: string): LessonStep {
  return {
    id,
    type: "clickLink",
    ...lines(`Find ${label}.`, "Click it."),
    linkLabel: label,
    expected: label,
    hint: `Find ${label}. Click it.`,
  };
}

function backStep(id: string): LessonStep {
  return {
    id,
    type: "browserBack",
    ...lines("Click Back."),
    hint: "Click Back.",
  };
}

function forwardStep(id: string): LessonStep {
  return {
    id,
    type: "browserForward",
    ...lines("Click Forward."),
    hint: "Click Forward.",
  };
}

function inboxStep(id: string): LessonStep {
  return {
    id,
    type: "openInbox",
    ...lines("Click Inbox."),
    hint: "Click Inbox.",
  };
}

function openEmailStep(
  id: string,
  contactId: string,
  inboxIds: string[] = DEFAULT_INBOX_IDS,
  bySubject = false,
): LessonStep {
  const contact = getContact(contactId);
  return {
    id,
    type: "openEmail",
    ...(bySubject
      ? lines("Look at Subject.", contact.subject, "Click the email.")
      : lines("Look at Who sent it.", contact.name, "Click the email.")),
    emailFrom: contact.id,
    emailSubject: contact.subject,
    expected: contact.id,
    options: inboxIds,
    hint: bySubject
      ? `Find subject: ${contact.subject}.`
      : `Find name: ${contact.name}.`,
  };
}

function backToInboxStep(id: string, contactId: string): LessonStep {
  const contact = getContact(contactId);
  return {
    id,
    type: "backToInbox",
    ...lines("Click Back.", "Go to Inbox."),
    emailFrom: contact.id,
    emailSubject: contact.subject,
    hint: "Click Back to Inbox.",
  };
}

function replySendStep(id: string, contactId: string, body: string): LessonStep {
  const contact = getContact(contactId);
  return {
    id,
    type: "replyEmail",
    ...lines("Click Reply.", `Type ${body}.`, "Click Send."),
    expected: body,
    emailFrom: contact.id,
    emailSubject: `Re: ${contact.subject}`,
    hint: `Type ${body}. ${keyHelpForText(body)}`.trim(),
  };
}

function composeEmailStep(
  id: string,
  contactId: string,
  subject: string,
  body: string,
  attachment = false,
): LessonStep {
  const contact = getContact(contactId);
  return {
    id,
    type: "composeEmail",
    composeStart: "new",
    ...lines(
      "Click New.",
      `To: ${contact.name}.`,
      `Subject: ${subject}.`,
      `Type ${body}.`,
      ...(attachment ? ["Attach a file."] : []),
      "Click Send.",
    ),
    expectedTo: contact.email,
    expectedSubject: subject,
    expected: body,
    requireAttachment: attachment,
    hint: attachment ? "Attach a file from your computer." : "Fill in the email. Click Send.",
  };
}

function downloadStep(id: string, fileName: string, contactId = "tutor"): LessonStep {
  const contact = getContact(contactId);
  return {
    id,
    type: "downloadAttachment",
    ...lines(`Find ${fileName}.`, "Click Download."),
    expected: fileName,
    emailFrom: contact.id,
    emailSubject: contact.subject,
    hint: `Click Download on ${fileName}.`,
  };
}

function uploadStep(id: string): LessonStep {
  return {
    id,
    type: "uploadFile",
    ...lines("Click Choose file.", "Pick a file.", "Click Open."),
    expected: "any-file",
    hint: "Choose a file from your computer.",
  };
}

function popBalloonStep(id: string, color: string): LessonStep {
  return {
    id,
    type: "click",
    ...lines(`Click the ${color} balloon.`),
    buttonLabel: `${color} balloon`,
    hint: `Click the ${color} balloon.`,
    theme: "balloon",
    themeColor: color,
  };
}

function openGiftStep(id: string, color: string): LessonStep {
  return {
    id,
    type: "doubleClick",
    ...lines(`Click the ${color} present.`, "Click again."),
    buttonLabel: `${color} present`,
    hint: `Click the ${color} present two times.`,
    theme: "gift",
    themeColor: color,
  };
}

function toyDropStep(id: string, toy: string, emoji: string): LessonStep {
  return {
    id,
    type: "dragDrop",
    ...lines(`Pick up ${toy}.`, "Drop in Toy box."),
    dragItem: toy,
    dropLabel: "Toy box",
    hint: `Drag the ${toy} to the toy box.`,
    theme: "playground",
    themeEmoji: emoji,
  };
}

function treasureScrollStep(id: string): LessonStep {
  return {
    id,
    type: "scroll",
    ...lines("Scroll down.", "Find the gold star."),
    scrollTarget: "gold star",
    hint: "Scroll down. Find the gold star.",
    theme: "treasure",
  };
}

function pickSnackStep(id: string, snack: string, options: string[]): LessonStep {
  return {
    id,
    type: "selectFile",
    ...lines(`Find ${snack}.`, "Click it."),
    expected: snack,
    options,
    hint: `Find ${snack}. Click it.`,
    theme: "playground",
  };
}

function pickPlayItemStep(id: string, item: string, options: string[], instructionLines?: string | string[]): LessonStep {
  const normalized = typeof instructionLines === "string"
    ? [instructionLines]
    : instructionLines;

  return {
    id,
    type: "selectFile",
    ...lines(...(normalized ?? [`Find ${item}.`, "Click it."])),
    expected: item,
    options,
    hint: `Find ${item}. Click it.`,
    theme: "playground",
  };
}

function petBasketStep(id: string, pet: string, emoji: string): LessonStep {
  return {
    id,
    type: "dragDrop",
    ...lines(`Pick up ${pet}.`, "Drop in Basket."),
    dragItem: pet,
    dropLabel: "Basket",
    hint: `Drag the ${pet} to the basket.`,
    theme: "playground",
    themeEmoji: emoji,
  };
}

function potDropStep(id: string, item: string, emoji: string): LessonStep {
  return {
    id,
    type: "dragDrop",
    ...lines(`Pick up ${item}.`, "Drop in Pot."),
    dragItem: item,
    dropLabel: "Pot",
    hint: `Drag the ${item} to the flower pot.`,
    theme: "playground",
    themeEmoji: emoji,
  };
}

function tapStarStep(id: string): LessonStep {
  return {
    id,
    type: "click",
    ...lines("Click the gold star."),
    buttonLabel: "Gold star",
    hint: "Click the gold star.",
    theme: "star",
  };
}

const FILE_POOL = [
  "Welcome.pdf",
  "Report.pdf",
  "Notes.txt",
  "Draft.txt",
  "practice.pdf",
  "Holiday.jpg",
  "Budget.xlsx",
  "Letter.docx",
];

const FOLDER_POOL = ["Documents", "Downloads", "Pictures", "Desktop", "Music"];

function pickFiles(count: number, target: string): string[] {
  const others = FILE_POOL.filter((f) => f !== target);
  const picked = [target];
  for (let i = 0; i < count - 1 && i < others.length; i += 1) {
    picked.push(others[i]);
  }
  return picked.slice(0, count);
}

function pickFolders(count: number, target: string): string[] {
  const others = FOLDER_POOL.filter((f) => f !== target);
  const picked = [target];
  for (let i = 0; i < count - 1 && i < others.length; i += 1) {
    picked.push(others[i]);
  }
  return picked.slice(0, count);
}

const computerBasicsSteps: LessonStep[] = [
  clickStep("c1", "Start"),
  clickStep("c2", "Continue"),
  clickStep("c3", "Next"),
  clickStep("c4", "OK"),
  clickStep("c5", "Open"),
  clickStep("c6", "Save"),
  clickStep("c7", "Help"),
  clickStep("c8", "Close"),
  clickStep("c9", "Done"),
  clickStep("c10", "Cancel"),
  clickStep("c11", "Apply"),
  clickStep("c12", "Exit"),
  doubleClickStep("c13", "Open file"),
  doubleClickStep("c14", "My document"),
  doubleClickStep("c15", "Photo album"),
  doubleClickStep("c16", "Library card"),
  doubleClickStep("c17", "Email icon"),
  doubleClickStep("c18", "Folder"),
  doubleClickStep("c19", "Music file"),
  doubleClickStep("c20", "Holiday photo"),
  selectFileStep("c21", "Welcome.pdf", pickFiles(4, "Welcome.pdf")),
  selectFileStep("c22", "Report.pdf", pickFiles(4, "Report.pdf")),
  selectFileStep("c23", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  selectFileStep("c24", "Letter.docx", pickFiles(4, "Letter.docx")),
  selectFileStep("c25", "Budget.xlsx", pickFiles(4, "Budget.xlsx")),
  selectFileStep("c26", "Notes.txt", pickFiles(4, "Notes.txt")),
  deleteFileStep("c27", "Notes.txt", ["Notes.txt", "Draft.txt", "Old.txt"]),
  deleteFileStep("c28", "Draft.txt", ["Welcome.pdf", "Draft.txt", "Notes.txt"]),
  deleteFileStep("c29", "Old.txt", ["Old.txt", "Temp.txt", "Copy.txt"]),
  deleteFileStep("c30", "Temp.txt", ["Temp.txt", "Copy.txt", "Draft.txt"]),
  openFolderStep("c31", "Documents", pickFolders(3, "Documents")),
  openFolderStep("c32", "Downloads", pickFolders(3, "Downloads")),
  openFolderStep("c33", "Pictures", pickFolders(3, "Pictures")),
  openFolderStep("c34", "Desktop", pickFolders(3, "Desktop")),
  openFolderStep("c35", "Music", pickFolders(3, "Music")),
  dragDropStep("c36", "Work.pdf", "Documents folder"),
  dragDropStep("c37", "Photo.jpg", "Pictures folder"),
  dragDropStep("c38", "Music.mp3", "Music folder"),
  dragDropStep("c39", "Letter.docx", "Documents folder"),
  dragDropStep("c40", "Budget.xlsx", "Documents folder"),
  scrollStep("c41", "Continue"),
  scrollStep("c42", "Finish"),
  clickStep("c43", "Finish", "Click Finish."),
  clickStep("c44", "Done"),
  clickStep("c45", "Exit"),
];

const keyboardSteps: LessonStep[] = [
  clickStep("k1", "Typing box", "Click the box."),
  ...wordCasePairSteps("k", 2, [
    "water",
    "hello",
    "library",
    "computer",
    "email",
    "tutor",
    "morning",
    "practice",
    "London",
  ]),
  typeStep("k20", "7"),
  typeStep("k21", "25"),
  typeStep("k22", "42"),
  typeStep("k23", "100"),
  typeStep("k24", "2026"),
  typeStep("k25", ","),
  typeStep("k26", "."),
  typeStep("k27", "?"),
  typeStep("k28", "!"),
  typeStep("k29", "@"),
  typeStep("k30", "/"),
  typeStep("k31", "#"),
  typeStep("k32", "-"),
  typeStep("k33", "_"),
  typeStep("k34", ":"),
  typeStep("k35", "'"),
  typeStep("k36", '"'),
  typeStep("k37", "%"),
  typeStep("k38", "£"),
  typeStep("k39", "£25"),
  typeStep("k40", "£10"),
  typeStep("k41", "50%"),
  typeStep("k42", "hello@example.com"),
  typeStep("k43", "www.example.com"),
  deleteTextStep("k44", "computer", "compute"),
  deleteTextStep("k45", "library", "librar"),
  deleteTextStep("k46", "London", "Londo"),
  deleteTextStep("k47", "practice", "practi"),
  enterStep("k48", "library"),
  enterStep("k49", "hello"),
  enterStep("k50", "computer"),
  enterStep("k51", "water"),
  enterStep("k52", "practice"),
  typeStep("k53", "thanks"),
  typeStep("k54", "Thanks"),
  typeStep("k55", "good morning"),
  typeStep("k56", "Good morning"),
  typeStep("k57", "My name is David."),
  typeStep("k58", "London is in England."),
  typeStep("k59", "I like reading books."),
  typeStep("k60", "your-name", "Type your first name."),
  enterStep("k61", "finish"),
  enterStep("k62", "Finish"),
];

const internetSteps: LessonStep[] = [
  browserOpenStep("i1"),
  addressStep("i2", "practice.example"),
  enterStep("i3", "practice.example"),
  searchStep("i4", "library"),
  linkStep("i5", "Local library"),
  searchStep("i6", "weather"),
  linkStep("i7", "Today's weather"),
  searchStep("i8", "bus times"),
  linkStep("i9", "Bus timetable"),
  backStep("i10"),
  forwardStep("i11"),
  browserOpenStep("i12"),
  addressStep("i13", "news.example"),
  addressStep("i14", "shop.example"),
  addressStep("i15", "learn.example"),
  searchStep("i16", "recipes"),
  linkStep("i17", "Easy recipes"),
  searchStep("i18", "maps"),
  linkStep("i19", "Find directions"),
  backStep("i20"),
  searchStep("i21", "jobs"),
  linkStep("i22", "Job listings"),
  searchStep("i23", "health"),
  linkStep("i24", "Health advice"),
  addressStep("i25", "bank.example"),
  addressStep("i26", "school.example"),
  searchStep("i27", "courses"),
  linkStep("i28", "Free courses"),
  backStep("i29"),
  backStep("i30"),
  forwardStep("i31"),
  searchStep("i32", "help"),
  linkStep("i33", "Get help online"),
  addressStep("i34", "community.example"),
  searchStep("i35", "events"),
  linkStep("i36", "Local events"),
  searchStep("i37", "library"),
  linkStep("i38", "Library opening times"),
  addressStep("i39", "travel.example"),
  searchStep("i40", "train times"),
  linkStep("i41", "Train timetable"),
  backStep("i42"),
  forwardStep("i43"),
  searchStep("i44", "shopping"),
  linkStep("i45", "Online shopping"),
  addressStep("i46", "learn.example"),
  searchStep("i47", "typing practice"),
  linkStep("i48", "Typing lessons"),
  backStep("i49"),
  backStep("i50"),
  forwardStep("i51"),
  searchStep("i52", "contact"),
  linkStep("i53", "Contact us"),
];

const filesSteps: LessonStep[] = [
  openFolderStep("f1", "Downloads", pickFolders(3, "Downloads")),
  selectFileStep("f2", "Welcome.pdf", pickFiles(4, "Welcome.pdf")),
  selectFileStep("f3", "Report.pdf", pickFiles(4, "Report.pdf")),
  openFolderStep("f4", "Documents", pickFolders(3, "Documents")),
  selectFileStep("f5", "Letter.docx", pickFiles(4, "Letter.docx")),
  uploadStep("f6"),
  uploadStep("f7"),
  deleteFileStep("f8", "Draft.txt", ["Draft.txt", "Notes.txt", "Old.txt"]),
  deleteFileStep("f9", "Notes.txt", ["Welcome.pdf", "Notes.txt", "Draft.txt"]),
  openFolderStep("f10", "Pictures", pickFolders(3, "Pictures")),
  selectFileStep("f11", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  dragDropStep("f12", "Photo.jpg", "Pictures folder"),
  openFolderStep("f13", "Desktop", pickFolders(3, "Desktop")),
  selectFileStep("f14", "Budget.xlsx", pickFiles(4, "Budget.xlsx")),
  uploadStep("f15"),
  deleteFileStep("f16", "Temp.txt", ["Temp.txt", "Copy.txt", "Old.txt"]),
  openFolderStep("f17", "Music", pickFolders(3, "Music")),
  selectFileStep("f18", "practice.pdf", pickFiles(4, "practice.pdf")),
  dragDropStep("f19", "Work.pdf", "Documents folder"),
  uploadStep("f20"),
  selectFileStep("f21", "Notes.txt", pickFiles(4, "Notes.txt")),
  deleteFileStep("f22", "Copy.txt", ["Copy.txt", "Draft.txt", "Temp.txt"]),
  openFolderStep("f23", "Downloads", pickFolders(3, "Downloads")),
  selectFileStep("f24", "Report.pdf", pickFiles(4, "Report.pdf")),
  uploadStep("f25"),
  dragDropStep("f26", "Letter.docx", "Documents folder"),
  selectFileStep("f27", "Welcome.pdf", pickFiles(4, "Welcome.pdf")),
  deleteFileStep("f28", "Old.txt", ["Old.txt", "Notes.txt", "Draft.txt"]),
  openFolderStep("f29", "Documents", pickFolders(3, "Documents")),
  uploadStep("f30"),
  selectFileStep("f31", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  dragDropStep("f32", "Budget.xlsx", "Documents folder"),
  openFolderStep("f33", "Pictures", pickFolders(3, "Pictures")),
  selectFileStep("f34", "practice.pdf", pickFiles(4, "practice.pdf")),
  deleteFileStep("f35", "Draft.txt", ["Draft.txt", "Notes.txt", "Welcome.pdf"]),
  uploadStep("f36"),
  dragDropStep("f37", "Photo.jpg", "Pictures folder"),
  openFolderStep("f38", "Desktop", pickFolders(3, "Desktop")),
  selectFileStep("f39", "Letter.docx", pickFiles(4, "Letter.docx")),
  uploadStep("f40"),
  deleteFileStep("f41", "Temp.txt", ["Temp.txt", "Copy.txt", "Old.txt"]),
  dragDropStep("f42", "Work.pdf", "Documents folder"),
  selectFileStep("f43", "Budget.xlsx", pickFiles(4, "Budget.xlsx")),
  openFolderStep("f44", "Music", pickFolders(3, "Music")),
  uploadStep("f45"),
];

const emailInbox = DEFAULT_INBOX_IDS;

const emailSteps: LessonStep[] = [
  inboxStep("e1"),
  openEmailStep("e2", "tutor", emailInbox),
  replySendStep("e3", "tutor", "thanks"),
  openEmailStep("e4", "library", emailInbox),
  replySendStep("e5", "library", "hello"),
  openEmailStep("e6", "support", emailInbox),
  replySendStep("e7", "support", "please help"),
  openEmailStep("e8", "james", emailInbox),
  replySendStep("e9", "james", "see you soon"),
  openEmailStep("e10", "eno", emailInbox),
  composeEmailStep("e11", "tutor", "My question", "I need help"),
  composeEmailStep("e12", "library", "Book request", "Can I borrow a book?"),
  openEmailStep("e13", "doctor", emailInbox),
  replySendStep("e14", "doctor", "thank you"),
  composeEmailStep("e15", "james", "Hello", "How are you?"),
  composeEmailStep("e16", "support", "Account help", "I cannot log in"),
  composeEmailStep("e17", "tutor", "Practice", "I am practising email"),
];

const attachmentSteps: LessonStep[] = [
  inboxStep("a1"),
  openEmailStep("a2", "tutor", emailInbox),
  downloadStep("a3", "practice.pdf", "tutor"),
  composeEmailStep("a4", "tutor", "My homework", "Please find my file attached.", true),
  openEmailStep("a5", "library", emailInbox),
  downloadStep("a6", "form.pdf", "library"),
  composeEmailStep("a7", "library", "Form attached", "Here is the form.", true),
  openEmailStep("a8", "eno", emailInbox),
  downloadStep("a9", "bill.pdf", "eno"),
  composeEmailStep("a10", "support", "Help with my account", "Please see the file.", true),
  composeEmailStep("a11", "james", "My photo", "Photo attached.", true),
];

const advancedInbox = ADVANCED_INBOX_IDS;

const emailAdvancedSteps: LessonStep[] = [
  inboxStep("x1"),
  openEmailStep("x2", "eno", advancedInbox, true),
  backToInboxStep("x3", "eno"),
  openEmailStep("x4", "bank", advancedInbox, true),
  replySendStep("x5", "bank", "I have paid already"),
  backToInboxStep("x6", "bank"),
  openEmailStep("x7", "mum", advancedInbox),
  replySendStep("x8", "mum", "yes I will be there"),
  openEmailStep("x9", "council", advancedInbox, true),
  replySendStep("x10", "council", "thank you for the reminder"),
  composeEmailStep("x11", "bank", "Payment query", "Please confirm my payment was received."),
  composeEmailStep("x12", "doctor", "Change appointment", "Can I move my appointment to next week?"),
  openEmailStep("x13", "support", advancedInbox),
  replySendStep("x14", "support", "I need help resetting my password"),
  openEmailStep("x15", "james", advancedInbox),
  backToInboxStep("x16", "james"),
  openEmailStep("x17", "tutor", advancedInbox, true),
  composeEmailStep("x18", "tutor", "Homework attached", "Please find my homework attached.", true),
  downloadStep("x19", "invoice.pdf", "eno"),
  composeEmailStep("x20", "eno", "Bill question", "I have a question about my latest bill.", true),
];

const mouseSkillsSteps: LessonStep[] = [
  ...["Start", "Continue", "Next", "OK", "Open", "Save", "Done", "Cancel", "Close", "Apply"].map((label, index) =>
    clickStep(`m${index + 1}`, label),
  ),
  ...["Open file", "My document", "Photo album", "Folder", "Email icon", "Music file", "Library card", "Desktop icon"].map(
    (label, index) => doubleClickStep(`m${index + 11}`, label),
  ),
  ...["Help", "Exit", "Finish", "Submit", "Send", "Yes", "No", "Retry", "Skip", "Confirm"].map((label, index) =>
    clickStep(`m${index + 19}`, label),
  ),
  ...["Settings", "Recycle bin", "Calculator", "Notepad"].map((label, index) => doubleClickStep(`m${index + 29}`, label)),
  scrollStep("m33", "Continue"),
  scrollStep("m34", "Finish"),
  clickStep("m35", "Finish", "Click Finish."),
  clickStep("m36", "Done"),
  clickStep("m37", "Exit"),
  clickStep("m38", "Start"),
  clickStep("m39", "Continue"),
  doubleClickStep("m40", "My document"),
  clickStep("m41", "OK"),
  doubleClickStep("m42", "Photo album"),
  clickStep("m43", "Done"),
];

const formsOnlineSteps: LessonStep[] = [
  clickStep("o1", "Typing box", "Click the box."),
  typeStep("o2", "your-name", "Type your first name."),
  typeStep("o3", "your-name", "Type your last name."),
  clickStep("o4", "Continue"),
  typeStep("o5", "hello@example.com"),
  typeStep("o6", "friend@example.com"),
  clickStep("o7", "Next"),
  typeStep("o8", "London"),
  typeStep("o9", "Manchester"),
  enterStep("o10", "Birmingham"),
  clickStep("o11", "Continue"),
  typeStep("o12", "SW1A 1AA"),
  typeStep("o13", "M1 1AE"),
  enterStep("o14", "EH1 1YZ"),
  clickStep("o15", "Next"),
  typeStep("o16", "07123 456789"),
  typeStep("o17", "07900 123456"),
  clickStep("o18", "Continue"),
  browserOpenStep("o19"),
  addressStep("o20", "forms.example"),
  addressStep("o21", "signup.example"),
  typeStep("o22", "library"),
  typeStep("o23", "computer"),
  enterStep("o24", "practice"),
  clickStep("o25", "Submit"),
  typeStep("o26", "My question"),
  typeStep("o27", "Book request"),
  enterStep("o28", "Help please"),
  clickStep("o29", "Send"),
  typeStep("o30", "tutor@example.org"),
  typeStep("o31", "My details"),
  typeStep("o32", "Please update my information."),
  clickStep("o33", "Send"),
  typeStep("o34", "thanks"),
  typeStep("o35", "Thank you"),
  enterStep("o36", "good morning"),
  clickStep("o37", "OK"),
  typeStep("o38", "I need help with my form."),
  enterStep("o39", "Please call me back."),
  clickStep("o40", "Submit"),
  browserOpenStep("o41"),
  addressStep("o42", "account.example"),
  searchStep("o43", "reset password"),
  linkStep("o44", "Reset your password"),
  backStep("o45"),
  clickStep("o46", "Done"),
];

const stayingSafeSteps: LessonStep[] = [
  browserOpenStep("s1"),
  searchStep("s2", "library opening times"),
  linkStep("s3", "Library opening times"),
  backStep("s4"),
  searchStep("s5", "weather today"),
  linkStep("s6", "Today's weather"),
  searchStep("s7", "bus times"),
  linkStep("s8", "Bus timetable"),
  backStep("s9"),
  forwardStep("s10"),
  addressStep("s11", "bank.example"),
  addressStep("s12", "gov.example"),
  searchStep("s13", "report a scam"),
  linkStep("s14", "Report a scam"),
  backStep("s15"),
  searchStep("s16", "trusted websites"),
  linkStep("s17", "Stay safe online"),
  searchStep("s18", "password help"),
  linkStep("s19", "Create a strong password"),
  backStep("s20"),
  browserOpenStep("s21"),
  addressStep("s22", "learn.example"),
  searchStep("s23", "online safety"),
  linkStep("s24", "Online safety tips"),
  searchStep("s25", "phishing email"),
  linkStep("s26", "Spot a fake email"),
  backStep("s27"),
  searchStep("s28", "community support"),
  linkStep("s29", "Get local support"),
  addressStep("s30", "health.example"),
  searchStep("s31", "NHS advice"),
  linkStep("s32", "Health advice"),
  backStep("s33"),
  backStep("s34"),
  forwardStep("s35"),
  searchStep("s36", "library"),
  linkStep("s37", "Local library"),
  searchStep("s38", "help"),
  linkStep("s39", "Get help online"),
  addressStep("s40", "school.example"),
  searchStep("s41", "courses"),
  linkStep("s42", "Free courses"),
  backStep("s43"),
  forwardStep("s44"),
  searchStep("s45", "jobs"),
  linkStep("s46", "Job listings"),
];

const passwordsSteps: LessonStep[] = [
  browserOpenStep("p1"),
  addressStep("p2", "login.example"),
  clickStep("p3", "Typing box", "Click the box."),
  typeStep("p4", "your-name", "Type your username."),
  typeStep("p5", "hello@example.com"),
  clickStep("p6", "Continue"),
  typeStep("p7", "practice123", "Type your password."),
  enterStep("p8", "practice123"),
  clickStep("p9", "Log in"),
  browserOpenStep("p10"),
  addressStep("p11", "account.example"),
  typeStep("p12", "your-name", "Type your email address."),
  typeStep("p13", "hello@example.com"),
  clickStep("p14", "Next"),
  typeStep("p15", "MyPassword1", "Type a new password."),
  typeStep("p16", "MyPassword1", "Type the same password again."),
  clickStep("p17", "Save"),
  searchStep("p18", "reset password"),
  linkStep("p19", "Reset your password"),
  backStep("p20"),
  addressStep("p21", "bank.example"),
  clickStep("p22", "Typing box", "Click the box."),
  typeStep("p23", "your-name", "Type your username."),
  enterStep("p24", "practice123"),
  clickStep("p25", "Sign in"),
  browserOpenStep("p26"),
  addressStep("p27", "signup.example"),
  typeStep("p28", "hello@example.com"),
  typeStep("p29", "friend@example.com"),
  clickStep("p30", "Continue"),
  typeStep("p31", "Welcome1", "Choose a password."),
  enterStep("p32", "Welcome1"),
  clickStep("p33", "Create account"),
  addressStep("p34", "login.example"),
  typeStep("p35", "hello@example.com"),
  typeStep("p36", "Welcome1"),
  clickStep("p37", "Log in"),
  searchStep("p38", "password help"),
  linkStep("p39", "Create a strong password"),
  backStep("p40"),
  clickStep("p41", "Done"),
];

const charactersSteps: LessonStep[] = [
  typeStep("ch1", "?", "Hold Shift. Press /."),
  typeStep("ch2", "@", "Hold Shift. Press the apostrophe key."),
  typeStep("ch3", "/", "Press /."),
  typeStep("ch4", "!", "Hold Shift. Press 1."),
  typeStep("ch5", "&", "Hold Shift. Press 7."),
  typeStep("ch6", "£", "Hold Shift. Press 3."),
  typeStep("ch7", "$", "Hold Shift. Press 4."),
  typeStep("ch8", "%", "Hold Shift. Press 5."),
  typeStep("ch9", "hello@example.com"),
  typeStep("ch10", "Tom & Sam"),
  typeStep("ch11", "£10.50"),
  typeStep("ch12", "Thanks! Please?"),
  enterStep("ch13", "finish"),
];

const shoppingSteps: LessonStep[] = [
  browserOpenStep("sh1"),
  searchStep("sh2", "online shop"),
  linkStep("sh3", "Online shopping"),
  searchStep("sh4", "shoes"),
  linkStep("sh5", "Shop shoes"),
  backStep("sh6"),
  searchStep("sh7", "groceries"),
  linkStep("sh8", "Food delivery"),
  addressStep("sh9", "shop.example"),
  searchStep("sh10", "books"),
  linkStep("sh11", "Buy books"),
  backStep("sh12"),
  forwardStep("sh13"),
  searchStep("sh14", "clothes"),
  linkStep("sh15", "Clothing store"),
  clickStep("sh16", "Typing box", "Click the box."),
  typeStep("sh17", "jacket"),
  enterStep("sh18", "jacket"),
  linkStep("sh19", "Winter jackets"),
  backStep("sh20"),
  searchStep("sh21", "gift ideas"),
  linkStep("sh22", "Gift shop"),
  addressStep("sh23", "market.example"),
  searchStep("sh24", "kitchen items"),
  linkStep("sh25", "Kitchen store"),
  backStep("sh26"),
  searchStep("sh27", "sale"),
  linkStep("sh28", "Today's deals"),
  browserOpenStep("sh29"),
  addressStep("sh30", "checkout.example"),
  typeStep("sh31", "your-name", "Type your name."),
  typeStep("sh32", "SW1A 1AA"),
  clickStep("sh33", "Continue"),
  typeStep("sh34", "07123 456789"),
  clickStep("sh35", "Next"),
  searchStep("sh36", "returns policy"),
  linkStep("sh37", "Returns and refunds"),
  backStep("sh38"),
  forwardStep("sh39"),
  searchStep("sh40", "track order"),
  linkStep("sh41", "Track my order"),
  clickStep("sh42", "Done"),
];

const photosSteps: LessonStep[] = [
  openFolderStep("ph1", "Pictures", pickFolders(3, "Pictures")),
  selectFileStep("ph2", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  selectFileStep("ph3", "photo.jpg", ["photo.jpg", "scan.jpg", "old.jpg"]),
  openFolderStep("ph4", "Desktop", pickFolders(3, "Desktop")),
  selectFileStep("ph5", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  dragDropStep("ph6", "Photo.jpg", "Pictures folder"),
  dragDropStep("ph7", "Holiday.jpg", "Pictures folder"),
  uploadStep("ph8"),
  uploadStep("ph9"),
  openFolderStep("ph10", "Downloads", pickFolders(3, "Downloads")),
  selectFileStep("ph11", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  deleteFileStep("ph12", "old.jpg", ["old.jpg", "photo.jpg", "scan.jpg"]),
  openFolderStep("ph13", "Pictures", pickFolders(3, "Pictures")),
  selectFileStep("ph14", "photo.jpg", ["photo.jpg", "Holiday.jpg", "scan.jpg"]),
  dragDropStep("ph15", "photo.jpg", "Pictures folder"),
  uploadStep("ph16"),
  openFolderStep("ph17", "Documents", pickFolders(3, "Documents")),
  selectFileStep("ph18", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  dragDropStep("ph19", "Holiday.jpg", "Pictures folder"),
  openFolderStep("ph20", "Pictures", pickFolders(3, "Pictures")),
  selectFileStep("ph21", "photo.jpg", pickFiles(4, "photo.jpg")),
  uploadStep("ph22"),
  deleteFileStep("ph23", "scan.jpg", ["scan.jpg", "photo.jpg", "old.jpg"]),
  dragDropStep("ph24", "Photo.jpg", "Pictures folder"),
  openFolderStep("ph25", "Desktop", pickFolders(3, "Desktop")),
  selectFileStep("ph26", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  uploadStep("ph27"),
  openFolderStep("ph28", "Pictures", pickFolders(3, "Pictures")),
  selectFileStep("ph29", "photo.jpg", pickFiles(4, "photo.jpg")),
  dragDropStep("ph30", "photo.jpg", "Pictures folder"),
  uploadStep("ph31"),
  selectFileStep("ph32", "Holiday.jpg", pickFiles(4, "Holiday.jpg")),
  openFolderStep("ph33", "Downloads", pickFolders(3, "Downloads")),
  deleteFileStep("ph34", "old.jpg", ["old.jpg", "Temp.txt", "Copy.txt"]),
  dragDropStep("ph35", "Holiday.jpg", "Pictures folder"),
  clickStep("ph36", "Done"),
];

const playgroundSteps: LessonStep[] = [
  popBalloonStep("pg1", "red"),
  popBalloonStep("pg2", "blue"),
  popBalloonStep("pg3", "yellow"),
  openGiftStep("pg4", "blue"),
  openGiftStep("pg5", "red"),
  openGiftStep("pg6", "green"),
  toyDropStep("pg7", "ball", "⚽"),
  toyDropStep("pg8", "teddy", "🧸"),
  treasureScrollStep("pg9"),
  typeStep("pg10", "your-name", "Write your name on the card."),
  pickSnackStep("pg11", "Apple", ["Apple", "Banana", "Orange"]),
  pickSnackStep("pg12", "Banana", ["Banana", "Orange", "Apple"]),
  popBalloonStep("pg13", "purple"),
  tapStarStep("pg14"),
  openFolderStep("pg15", "Toy box", ["Toy box", "Kitchen", "Garden"]),
  toyDropStep("pg16", "car", "🚗"),
  popBalloonStep("pg17", "pink"),
  openGiftStep("pg18", "yellow"),
  pickSnackStep("pg19", "Orange", ["Orange", "Apple", "Banana"]),
  typeStep("pg20", "hello", "Type hello."),
  openGiftStep("pg21", "purple"),
  tapStarStep("pg22"),
  clickStep("pg23", "Done", "Tap Done."),
];

const birthdaySteps: LessonStep[] = [
  openGiftStep("bd1", "blue"),
  popBalloonStep("bd2", "red"),
  popBalloonStep("bd3", "yellow"),
  typeStep("bd4", "your-name", "Write your name on the card."),
  typeStep("bd5", "party", "Type party."),
  pickPlayItemStep("bd6", "Cake", ["Cake", "Cookie", "Ice cream"]),
  pickPlayItemStep("bd7", "Cookie", ["Cookie", "Cake", "Ice cream"]),
  toyDropStep("bd8", "ball", "🎈"),
  openGiftStep("bd9", "pink"),
  treasureScrollStep("bd10"),
  tapStarStep("bd11"),
  typeStep("bd12", "thanks", "Type thanks."),
  popBalloonStep("bd13", "purple"),
  openGiftStep("bd14", "green"),
  pickPlayItemStep("bd15", "Ice cream", ["Ice cream", "Cake", "Cookie"], "Find the ice cream. Click it."),
  tapStarStep("bd16"),
  clickStep("bd17", "Done", "Tap Done."),
];

const petshopSteps: LessonStep[] = [
  browserOpenStep("ps1"),
  searchStep("ps2", "puppies"),
  linkStep("ps3", "Puppy page"),
  pickPlayItemStep("ps4", "Dog", ["Dog", "Cat", "Rabbit"]),
  petBasketStep("ps5", "Dog", "🐶"),
  pickPlayItemStep("ps6", "Cat", ["Cat", "Dog", "Fish"]),
  petBasketStep("ps7", "Cat", "🐱"),
  searchStep("ps8", "kittens"),
  linkStep("ps9", "Kitten page"),
  pickPlayItemStep("ps10", "Rabbit", ["Rabbit", "Fish", "Dog"]),
  petBasketStep("ps11", "Rabbit", "🐰"),
  popBalloonStep("ps12", "blue"),
  pickPlayItemStep("ps13", "Fish", ["Fish", "Cat", "Dog"]),
  backStep("ps14"),
  tapStarStep("ps15"),
  openGiftStep("ps16", "yellow"),
  clickStep("ps17", "Done", "Tap Done."),
];

const toyroomSteps: LessonStep[] = [
  toyDropStep("tr1", "ball", "⚽"),
  toyDropStep("tr2", "teddy", "🧸"),
  toyDropStep("tr3", "car", "🚗"),
  toyDropStep("tr4", "blocks", "🧱"),
  popBalloonStep("tr5", "green"),
  openGiftStep("tr6", "blue"),
  toyDropStep("tr7", "doll", "🪆"),
  tapStarStep("tr8"),
  toyDropStep("tr9", "train", "🚂"),
  clickStep("tr10", "Done", "Tap Done."),
];

const gardenSteps: LessonStep[] = [
  pickPlayItemStep("gn1", "Flower", ["Flower", "Rose", "Sunflower"]),
  pickPlayItemStep("gn2", "Rose", ["Rose", "Sunflower", "Flower"]),
  potDropStep("gn3", "seed", "🌱"),
  potDropStep("gn4", "seedling", "🌿"),
  pickPlayItemStep("gn5", "Sunflower", ["Sunflower", "Flower", "Rose"]),
  treasureScrollStep("gn6"),
  typeStep("gn7", "grow", "Type grow."),
  popBalloonStep("gn8", "yellow"),
  tapStarStep("gn9"),
  clickStep("gn10", "Done", "Tap Done."),
];

const rainydaySteps: LessonStep[] = [
  pickPlayItemStep("rd1", "Umbrella", ["Umbrella", "Boots", "Coat"]),
  pickPlayItemStep("rd2", "Boots", ["Boots", "Coat", "Umbrella"]),
  pickPlayItemStep("rd3", "Coat", ["Coat", "Umbrella", "Boots"]),
  popBalloonStep("rd4", "blue"),
  toyDropStep("rd5", "boots", "🥾"),
  typeStep("rd6", "rain", "Type rain."),
  openGiftStep("rd7", "yellow"),
  tapStarStep("rd8"),
  clickStep("rd9", "Done", "Tap Done."),
];

export const lessons: Lesson[] = [
  {
    id: "computer",
    title: "Computer Basics",
    description: "Click, double-click, drag, scroll and delete.",
    icon: faComputerMouse,
    steps: computerBasicsSteps,
  },
  {
    id: "keyboard",
    title: "Keyboard Basics",
    description: "Practise typing letters, numbers and symbols.",
    icon: faKeyboard,
    steps: keyboardSteps,
  },
  {
    id: "characters",
    title: "Characters & Symbols",
    description: "Practise UK keyboard keys like @, ?, £, %, and &.",
    icon: faKeyboard,
    steps: charactersSteps,
  },
  {
    id: "internet",
    title: "Using the Internet",
    description: "Practise websites, searches, links and navigation.",
    icon: faGlobe,
    steps: internetSteps,
  },
  {
    id: "files",
    title: "Files",
    description: "Practise opening, downloading and uploading files.",
    icon: faFolder,
    steps: filesSteps,
  },
  {
    id: "email",
    title: "Email",
    description: "Practise reading, writing and sending email.",
    icon: faEnvelope,
    steps: emailSteps,
  },
  {
    id: "attachments",
    title: "Attachments",
    description: "Practise downloading and attaching files.",
    icon: faPaperclip,
    steps: attachmentSteps,
  },
  {
    id: "email-advanced",
    title: "Email — Next Steps",
    description: "A fuller inbox, longer replies, and trickier tasks for people with some experience.",
    icon: faEnvelope,
    steps: emailAdvancedSteps,
  },
  {
    id: "mouse",
    title: "Mouse Skills",
    description: "Practise clicking and double-clicking with confidence.",
    icon: faHandPointer,
    steps: mouseSkillsSteps,
  },
  {
    id: "forms",
    title: "Forms Online",
    description: "Practise filling in forms, names, emails and addresses.",
    icon: faPenToSquare,
    steps: formsOnlineSteps,
  },
  {
    id: "safety",
    title: "Staying Safe Online",
    description: "Practise searching, links and safe browsing habits.",
    icon: faShieldHalved,
    steps: stayingSafeSteps,
  },
  {
    id: "passwords",
    title: "Passwords & Login",
    description: "Practise signing in, passwords and account pages.",
    icon: faKey,
    steps: passwordsSteps,
  },
  {
    id: "shopping",
    title: "Shopping Online",
    description: "Practise searching shops, products and checkout forms.",
    icon: faCartShopping,
    steps: shoppingSteps,
  },
  {
    id: "photos",
    title: "Photos & Pictures",
    description: "Practise finding, moving and uploading photos.",
    icon: faImage,
    steps: photosSteps,
  },
  {
    id: "playground",
    title: "Fun Computer Playground",
    description: "Pop balloons, open presents, tidy toys and find treasure.",
    icon: faGamepad,
    steps: playgroundSteps,
  },
  {
    id: "birthday",
    title: "Birthday Party",
    description: "Open presents, pick a cake and write on a birthday card.",
    icon: faCakeCandles,
    steps: birthdaySteps,
  },
  {
    id: "petshop",
    title: "Pet Shop",
    description: "Search for pets, pick your favourite and put them in a basket.",
    icon: faPaw,
    steps: petshopSteps,
  },
  {
    id: "toyroom",
    title: "Toy Room",
    description: "Tidy toys away by putting them in the toy box.",
    icon: faBoxOpen,
    steps: toyroomSteps,
  },
  {
    id: "garden",
    title: "Garden",
    description: "Pick flowers and plant seeds in a flower pot.",
    icon: faSeedling,
    steps: gardenSteps,
  },
  {
    id: "rainyday",
    title: "Rainy Day",
    description: "Pick rain clothes and put your boots away.",
    icon: faCloudRain,
    steps: rainydaySteps,
  },
];

export const totalStepCount = lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);

export function getNextLesson(currentIndex: number): Lesson | null {
  if (currentIndex >= lessons.length - 1) return null;
  return lessons[currentIndex + 1];
}
