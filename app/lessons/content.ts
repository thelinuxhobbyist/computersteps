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
import { INBOX_SUBJECTS, senderAddress } from "./email-data";

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

function clickStep(id: string, label: string, instruction?: string): LessonStep {
  return {
    id,
    type: "click",
    instruction: instruction ?? `Click ${label}.`,
    buttonLabel: label,
    hint: `Click ${label}.`,
  };
}

function doubleClickStep(id: string, label: string): LessonStep {
  return {
    id,
    type: "doubleClick",
    instruction: `Click ${label} two times.`,
    buttonLabel: label,
    hint: `Click ${label} two times.`,
  };
}

function selectFileStep(id: string, fileName: string, options: string[]): LessonStep {
  return {
    id,
    type: "selectFile",
    instruction: `Find ${fileName.toLowerCase()}. Click it.`,
    expected: fileName,
    options,
    hint: `Find ${fileName.toLowerCase()}. Click it.`,
  };
}

function deleteFileStep(id: string, fileName: string, options: string[]): LessonStep {
  return {
    id,
    type: "deleteFile",
    instruction: `Find ${fileName.toLowerCase()}. Click delete.`,
    expected: fileName,
    options,
    hint: `Find ${fileName.toLowerCase()}. Click delete.`,
  };
}

function openFolderStep(id: string, folderName: string, options: string[]): LessonStep {
  return {
    id,
    type: "openFolder",
    instruction: `Find ${folderName.toLowerCase()}. Click it.`,
    expected: folderName,
    options,
    hint: `Find ${folderName.toLowerCase()}. Click it.`,
  };
}

function dragDropStep(id: string, item: string, dropLabel: string): LessonStep {
  return {
    id,
    type: "dragDrop",
    instruction: `Drag ${item} to ${dropLabel}.`,
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
    instruction: `Scroll down. Find ${target}.`,
    scrollTarget: target,
    expected: target,
    hint: `Scroll down. Find ${target}.`,
  };
}

function formatTypeInstruction(text: string): string {
  if (text.includes(" ")) {
    return `Type ${text}.`;
  }

  const keyHelp = keyHelpForText(text);
  if (keyHelp) return keyHelp;

  return `Type ${text}.`;
}

function typeStep(id: string, word: string, instruction?: string): LessonStep {
  return {
    id,
    type: "typeText",
    instruction: instruction ?? formatTypeInstruction(word),
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
    instruction: `Delete until it says "${expected}".`,
    expected,
    target: start,
    hint: "Use Backspace.",
  };
}

function enterStep(id: string, word: string): LessonStep {
  return {
    id,
    type: "pressEnter",
    instruction: `Type ${word}. Press Enter.`,
    expected: word,
    hint: `Type ${word}. Press Enter.`,
  };
}

function browserOpenStep(id: string): LessonStep {
  return {
    id,
    type: "openBrowser",
    instruction: "Open the browser.",
    hint: "Open the browser.",
  };
}

function addressStep(id: string, address: string): LessonStep {
  return {
    id,
    type: "browserAddress",
    instruction: `Type ${address}.`,
    expected: address,
    hint: `Type ${address}.`,
  };
}

function searchStep(id: string, query: string): LessonStep {
  return {
    id,
    type: "searchInternet",
    instruction: `Type ${query}. Click Search.`,
    searchQuery: query,
    expected: query,
    hint: `Type ${query}. Click Search.`,
  };
}

function linkStep(id: string, label: string): LessonStep {
  return {
    id,
    type: "clickLink",
    instruction: `Find ${label}. Click it.`,
    linkLabel: label,
    expected: label,
    hint: `Find ${label}. Click it.`,
  };
}

function backStep(id: string): LessonStep {
  return {
    id,
    type: "browserBack",
    instruction: "Click Back.",
    hint: "Click Back.",
  };
}

function forwardStep(id: string): LessonStep {
  return {
    id,
    type: "browserForward",
    instruction: "Click Forward.",
    hint: "Click Forward.",
  };
}

function inboxStep(id: string): LessonStep {
  return {
    id,
    type: "openInbox",
    instruction: "Open Inbox.",
    hint: "Open Inbox.",
  };
}

function openEmailStep(id: string, from: string, senders: string[]): LessonStep {
  return {
    id,
    type: "openEmail",
    instruction: `Find the message from ${from}. Click it.`,
    emailFrom: from,
    emailSubject: INBOX_SUBJECTS[from] ?? "Message for you",
    expected: from,
    options: senders,
    hint: `Find the message from ${from}. Click it.`,
  };
}

function replyStep(id: string, from: string): LessonStep {
  const subject = INBOX_SUBJECTS[from];
  return {
    id,
    type: "replyEmail",
    instruction: "Click Reply.",
    emailFrom: senderAddress(from),
    emailSubject: subject ? `Re: ${subject}` : "Re: Your message",
    hint: "Click Reply.",
  };
}

function recipientStep(id: string, email: string): LessonStep {
  return {
    id,
    type: "typeRecipient",
    instruction: `Type ${email}.`,
    expected: email,
    hint: `Type ${email}.`,
  };
}

function subjectStep(id: string, subject: string, to?: string): LessonStep {
  return {
    id,
    type: "typeSubject",
    instruction: `Type "${subject}".`,
    expected: subject,
    hint: `Type "${subject}".`,
    composeTo: to,
  };
}

function messageStep(id: string, text: string): LessonStep {
  return {
    id,
    type: "typeText",
    instruction: `Type ${text}.`,
    expected: text,
    hint: `Type ${text}. ${keyHelpForText(text)}`.trim(),
  };
}

function emailBodyStep(
  id: string,
  text: string,
  preview?: { to?: string; subject?: string },
): LessonStep {
  return {
    id,
    type: "typeEmailBody",
    instruction: `Type ${text}.`,
    expected: text,
    hint: `Type ${text}. ${keyHelpForText(text)}`.trim(),
    composeTo: preview?.to,
    composeSubject: preview?.subject,
  };
}

function sendStep(
  id: string,
  preview?: { to?: string; subject?: string; body?: string; attachment?: string },
): LessonStep {
  return {
    id,
    type: "composeEmail",
    instruction: "Click Send.",
    expected: "send",
    hint: "Click Send.",
    composeTo: preview?.to,
    composeSubject: preview?.subject,
    composeBody: preview?.body,
    composeAttachment: preview?.attachment,
  };
}

function downloadStep(id: string, fileName: string, from = "Tutor"): LessonStep {
  return {
    id,
    type: "downloadAttachment",
    instruction: `Find ${fileName}. Click Download.`,
    expected: fileName,
    emailFrom: senderAddress(from),
    emailSubject: INBOX_SUBJECTS[from] ?? "Message for you",
    hint: `Find ${fileName}. Click Download.`,
  };
}

function attachStep(
  id: string,
  preview?: { to?: string; subject?: string; body?: string },
): LessonStep {
  return {
    id,
    type: "attachFile",
    instruction: "Click Attach file. Choose a file from your computer.",
    expected: "any-file",
    hint: "Click Attach file. Choose a file from your computer.",
    composeTo: preview?.to,
    composeSubject: preview?.subject,
    composeBody: preview?.body,
  };
}

function uploadStep(id: string): LessonStep {
  return {
    id,
    type: "uploadFile",
    instruction: "Click Choose file. Pick a file. Click Open.",
    expected: "any-file",
    hint: "Click Choose file. Pick a file. Click Open.",
  };
}

function popBalloonStep(id: string, color: string): LessonStep {
  return {
    id,
    type: "click",
    instruction: `Pop the ${color} balloon.`,
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
    instruction: `Open the ${color} present. Click it two times.`,
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
    instruction: `Put the ${toy} in the toy box.`,
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
    instruction: "Scroll down. Find the gold star.",
    scrollTarget: "gold star",
    hint: "Scroll down. Find the gold star.",
    theme: "treasure",
  };
}

function pickSnackStep(id: string, snack: string, options: string[]): LessonStep {
  return {
    id,
    type: "selectFile",
    instruction: `Find the ${snack.toLowerCase()}. Click it.`,
    expected: snack,
    options,
    hint: `Find the ${snack.toLowerCase()}. Click it.`,
    theme: "playground",
  };
}

function pickPlayItemStep(id: string, item: string, options: string[], instruction?: string): LessonStep {
  const text = instruction ?? `Find the ${item.toLowerCase()}. Click it.`;
  return {
    id,
    type: "selectFile",
    instruction: text,
    expected: item,
    options,
    hint: text,
    theme: "playground",
  };
}

function petBasketStep(id: string, pet: string, emoji: string): LessonStep {
  return {
    id,
    type: "dragDrop",
    instruction: `Put the ${pet} in the basket.`,
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
    instruction: `Put the ${item} in the pot.`,
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
    instruction: "Tap the gold star.",
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

const emailSenders = ["Tutor", "Library", "Support", "Friend", "Doctor"];

const emailSteps: LessonStep[] = [
  inboxStep("e1"),
  openEmailStep("e2", "Tutor", emailSenders),
  replyStep("e3", "Tutor"),
  emailBodyStep("e4", "thanks"),
  sendStep("e5"),
  inboxStep("e6"),
  openEmailStep("e7", "Library", emailSenders),
  replyStep("e8", "Library"),
  emailBodyStep("e9", "hello"),
  sendStep("e10"),
  inboxStep("e11"),
  openEmailStep("e12", "Support", emailSenders),
  replyStep("e13", "Support"),
  emailBodyStep("e14", "please help"),
  sendStep("e15"),
  inboxStep("e16"),
  openEmailStep("e17", "Friend", emailSenders),
  replyStep("e18", "Friend"),
  emailBodyStep("e19", "see you soon"),
  sendStep("e20"),
  recipientStep("e21", "tutor@example.org"),
  subjectStep("e22", "My question", "tutor@example.org"),
  emailBodyStep("e23", "I need help", { to: "tutor@example.org", subject: "My question" }),
  sendStep("e24", { to: "tutor@example.org", subject: "My question", body: "I need help" }),
  recipientStep("e25", "library@example.org"),
  subjectStep("e26", "Book request", "library@example.org"),
  emailBodyStep("e27", "Can I borrow a book?", { to: "library@example.org", subject: "Book request" }),
  sendStep("e28", { to: "library@example.org", subject: "Book request", body: "Can I borrow a book?" }),
  inboxStep("e29"),
  openEmailStep("e30", "Doctor", emailSenders),
  replyStep("e31", "Doctor"),
  emailBodyStep("e32", "thank you"),
  sendStep("e33"),
  recipientStep("e34", "friend@example.org"),
  subjectStep("e35", "Hello", "friend@example.org"),
  emailBodyStep("e36", "How are you?", { to: "friend@example.org", subject: "Hello" }),
  sendStep("e37", { to: "friend@example.org", subject: "Hello", body: "How are you?" }),
  inboxStep("e38"),
  openEmailStep("e39", "Tutor", emailSenders),
  replyStep("e40", "Tutor"),
  emailBodyStep("e41", "I finished the lesson"),
  sendStep("e42"),
  recipientStep("e43", "support@example.org"),
  subjectStep("e44", "Account help", "support@example.org"),
  emailBodyStep("e45", "I cannot log in", { to: "support@example.org", subject: "Account help" }),
  sendStep("e46", { to: "support@example.org", subject: "Account help", body: "I cannot log in" }),
  inboxStep("e47"),
  openEmailStep("e48", "Library", emailSenders),
  replyStep("e49", "Library"),
  emailBodyStep("e50", "Thank you for your help"),
  sendStep("e51"),
  recipientStep("e52", "tutor@example.org"),
  subjectStep("e53", "Practice", "tutor@example.org"),
  emailBodyStep("e54", "I am practising email", { to: "tutor@example.org", subject: "Practice" }),
  sendStep("e55", { to: "tutor@example.org", subject: "Practice", body: "I am practising email" }),
];

const attachmentSteps: LessonStep[] = [
  inboxStep("a1"),
  openEmailStep("a2", "Tutor", emailSenders),
  downloadStep("a3", "practice.pdf"),
  selectFileStep("a4", "practice.pdf", pickFiles(4, "practice.pdf")),
  openFolderStep("a5", "Downloads", pickFolders(3, "Downloads")),
  recipientStep("a6", "tutor@example.org"),
  subjectStep("a7", "My homework", "tutor@example.org"),
  emailBodyStep("a8", "Please find my file attached.", { to: "tutor@example.org", subject: "My homework" }),
  attachStep("a9", { to: "tutor@example.org", subject: "My homework", body: "Please find my file attached." }),
  sendStep("a10", { to: "tutor@example.org", subject: "My homework", body: "Please find my file attached.", attachment: "Attached file" }),
  inboxStep("a11"),
  openEmailStep("a12", "Library", emailSenders),
  downloadStep("a13", "form.pdf"),
  selectFileStep("a14", "form.pdf", ["form.pdf", "guide.pdf", "list.pdf"]),
  attachStep("a15"),
  sendStep("a16", { attachment: "Attached file" }),
  inboxStep("a17"),
  openEmailStep("a18", "Support", emailSenders),
  downloadStep("a19", "instructions.pdf"),
  selectFileStep("a20", "instructions.pdf", pickFiles(4, "instructions.pdf")),
  recipientStep("a21", "support@example.org"),
  subjectStep("a22", "Help with my account", "support@example.org"),
  attachStep("a23", { to: "support@example.org", subject: "Help with my account" }),
  sendStep("a24", { to: "support@example.org", subject: "Help with my account", attachment: "Attached file" }),
  downloadStep("a25", "receipt.pdf"),
  selectFileStep("a26", "receipt.pdf", pickFiles(4, "receipt.pdf")),
  attachStep("a27"),
  sendStep("a28", { attachment: "Attached file" }),
  inboxStep("a29"),
  openEmailStep("a30", "Tutor", emailSenders),
  downloadStep("a31", "worksheet.pdf"),
  openFolderStep("a32", "Downloads", pickFolders(3, "Downloads")),
  selectFileStep("a33", "worksheet.pdf", pickFiles(4, "worksheet.pdf")),
  recipientStep("a34", "tutor@example.org"),
  subjectStep("a35", "Completed worksheet", "tutor@example.org"),
  emailBodyStep("a36", "I finished the worksheet.", { to: "tutor@example.org", subject: "Completed worksheet" }),
  attachStep("a37", { to: "tutor@example.org", subject: "Completed worksheet", body: "I finished the worksheet." }),
  sendStep("a38", { to: "tutor@example.org", subject: "Completed worksheet", body: "I finished the worksheet.", attachment: "Attached file" }),
  inboxStep("a39"),
  openEmailStep("a40", "Library", emailSenders),
  downloadStep("a41", "guide.pdf"),
  selectFileStep("a42", "guide.pdf", ["guide.pdf", "form.pdf", "list.pdf"]),
  attachStep("a43"),
  sendStep("a44", { attachment: "Attached file" }),
  downloadStep("a45", "photo.jpg"),
  selectFileStep("a46", "photo.jpg", pickFiles(4, "photo.jpg")),
  recipientStep("a47", "friend@example.org"),
  subjectStep("a48", "My photo", "friend@example.org"),
  attachStep("a49", { to: "friend@example.org", subject: "My photo" }),
  sendStep("a50", { to: "friend@example.org", subject: "My photo", attachment: "Attached file" }),
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
  recipientStep("o30", "tutor@example.org"),
  subjectStep("o31", "My details"),
  messageStep("o32", "Please update my information."),
  sendStep("o33"),
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
