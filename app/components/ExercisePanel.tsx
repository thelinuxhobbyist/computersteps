"use client";

import { useRef, useState, type CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import EmailClient from "./EmailClient";
import { uploadFileToWorker } from "../lib/upload";
import { isAnswerCorrect, isFileSafeForUpload } from "../lesson-utils";
import type { LessonStep } from "../lessons/types";

const BALLOON_COLORS: Record<string, string> = {
  red: "#e53e3e",
  blue: "#3182ce",
  yellow: "#ecc94b",
  green: "#38a169",
  purple: "#805ad5",
  pink: "#ed64a6",
};

const GIFT_COLORS: Record<string, string> = {
  red: "#c53030",
  blue: "#2b6cb0",
  green: "#2f855a",
  yellow: "#b7791f",
  purple: "#6b46c1",
  pink: "#d53f8c",
};

const SNACK_EMOJI: Record<string, string> = {
  Apple: "🍎",
  Banana: "🍌",
  Orange: "🍊",
  Cake: "🎂",
  Cookie: "🍪",
  "Ice cream": "🍦",
  Dog: "🐶",
  Cat: "🐱",
  Rabbit: "🐰",
  Fish: "🐠",
  Flower: "🌸",
  Rose: "🌹",
  Sunflower: "🌻",
  Umbrella: "☂️",
  Boots: "🥾",
  Coat: "🧥",
};

type PlayDropKind = "box" | "basket" | "pot";

function getPlayDropKind(dropLabel?: string): PlayDropKind {
  if (dropLabel === "Basket") return "basket";
  if (dropLabel === "Pot") return "pot";
  return "box";
}

function PlayDropTarget({ kind, label, ready }: { kind: PlayDropKind; label: string; ready: boolean }) {
  if (kind === "basket") {
    return (
      <div className={`play-drop play-drop--basket ${ready ? "is-ready" : ""}`}>
        <div className="play-drop__basket" aria-hidden="true">
          <div className="play-drop__basket-handle" />
          <div className="play-drop__basket-rim" />
          <div className="play-drop__basket-body">
            <span className="play-drop__basket-line" />
            <span className="play-drop__basket-line" />
            <span className="play-drop__basket-line" />
          </div>
        </div>
        <p className="play-drop__label">{label}</p>
      </div>
    );
  }

  if (kind === "pot") {
    return (
      <div className={`play-drop play-drop--pot ${ready ? "is-ready" : ""}`}>
        <div className="play-drop__pot" aria-hidden="true">
          <div className="play-drop__pot-soil" />
          <div className="play-drop__pot-rim" />
          <div className="play-drop__pot-body" />
        </div>
        <p className="play-drop__label">{label}</p>
      </div>
    );
  }

  return (
    <div className={`play-drop play-drop--box ${ready ? "is-ready" : ""}`}>
      <div className="play-drop__box-scene" aria-hidden="true">
        <div className="play-drop__box-flap play-drop__box-flap--back" />
        <div className="play-drop__box-flap play-drop__box-flap--left" />
        <div className="play-drop__box-flap play-drop__box-flap--right" />
        <div className="play-drop__box-inner" />
        <div className="play-drop__box-panel play-drop__box-panel--front" />
        <div className="play-drop__box-panel play-drop__box-panel--side" />
        <div className="play-drop__box-panel play-drop__box-panel--bottom" />
      </div>
      <p className="play-drop__label">{label}</p>
    </div>
  );
}

type ExercisePanelProps = {
  step: LessonStep;
  stepComplete: boolean;
  onSuccess: () => void;
  onError: () => void;
};

function successLabel(label: string, stepComplete: boolean) {
  return stepComplete ? `✓ ${label}` : label;
}

export default function ExercisePanel({ step, stepComplete, onSuccess, onError }: ExercisePanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [visibleFiles, setVisibleFiles] = useState<string[]>(step.options ?? []);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropReady, setDropReady] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(
    step.type === "openBrowser" || step.type === "browserAddress" || step.type === "searchInternet" || step.type === "clickLink" || step.type === "browserBack" || step.type === "browserForward",
  );
  const [browserAddress, setBrowserAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDone, setSearchDone] = useState(false);
  const [pageHistory] = useState<string[]>(step.type === "browserBack" || step.type === "browserForward" ? ["Home", "Search results", "Article page"] : ["Home"]);
  const [historyIndex, setHistoryIndex] = useState(step.type === "browserBack" ? 2 : step.type === "browserForward" ? 1 : 0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [scrollReached, setScrollReached] = useState(false);
  const [playAnimating, setPlayAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const succeed = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onSuccess();
  };

  const fail = () => {
    if (completedRef.current) return;
    onError();
  };

  const checkTyped = (value: string, expected?: string, type?: string) => {
    if (isAnswerCorrect(value, expected, type)) {
      succeed();
    } else {
      fail();
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || scrollReached) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom) {
      setScrollReached(true);
      succeed();
    }
  };

  switch (step.type) {
    case "click":
      if (step.theme === "balloon") {
        const balloonColor = BALLOON_COLORS[step.themeColor ?? "red"] ?? BALLOON_COLORS.red;
        return (
          <div className="task-panel flex justify-center py-6 sm:py-8">
            <button
              type="button"
              aria-label={step.buttonLabel ?? "Balloon"}
              onClick={() => {
                setPlayAnimating(true);
                succeed();
              }}
              className={`play-balloon ${playAnimating || stepComplete ? "is-popped" : ""} ${stepComplete ? "is-success" : ""}`}
              style={{ "--balloon-color": balloonColor } as CSSProperties}
            >
              <span className="play-balloon__body" aria-hidden="true" />
              <span className="play-balloon__shine" aria-hidden="true" />
              <span className="play-balloon__string" aria-hidden="true" />
              {playAnimating || stepComplete ? (
                <span className="play-balloon__pop" aria-hidden="true">Pop!</span>
              ) : null}
            </button>
          </div>
        );
      }

      if (step.theme === "star") {
        return (
          <div className="task-panel flex justify-center py-6 sm:py-8">
            <button
              type="button"
              onClick={succeed}
              className={`play-star ${stepComplete ? "is-success" : ""}`}
              aria-label={step.buttonLabel ?? "Star"}
            >
              <span className="play-star__icon" aria-hidden="true">⭐</span>
            </button>
          </div>
        );
      }

      return (
        <div className="task-panel flex justify-center py-6 sm:py-8">
          <button
            type="button"
            onClick={succeed}
            className={`task-button secondary px-6 py-4 text-xl sm:px-8 sm:py-5 sm:text-2xl ${stepComplete ? "is-success" : ""}`}
          >
            {successLabel(step.buttonLabel ?? "Click me", stepComplete)}
          </button>
        </div>
      );

    case "doubleClick":
      if (step.theme === "gift") {
        const giftColor = GIFT_COLORS[step.themeColor ?? "blue"] ?? GIFT_COLORS.blue;
        return (
          <div className="task-panel flex justify-center py-6 sm:py-8">
            <button
              type="button"
              aria-label={step.buttonLabel ?? "Present"}
              onDoubleClick={() => {
                setPlayAnimating(true);
                succeed();
              }}
              className={`play-gift ${playAnimating || stepComplete ? "is-open" : ""} ${stepComplete ? "is-success" : ""}`}
              style={{ "--gift-color": giftColor } as CSSProperties}
            >
              <span className="play-gift__lid" aria-hidden="true" />
              <span className="play-gift__box" aria-hidden="true" />
              <span className="play-gift__ribbon-v" aria-hidden="true" />
              <span className="play-gift__ribbon-h" aria-hidden="true" />
              <span className="play-gift__bow" aria-hidden="true">🎀</span>
              {playAnimating || stepComplete ? (
                <span className="play-gift__surprise" aria-hidden="true">🎉</span>
              ) : null}
            </button>
          </div>
        );
      }

      return (
        <div className="task-panel flex justify-center py-6 sm:py-8">
          <button
            type="button"
            onDoubleClick={succeed}
            className={`task-button px-6 py-4 text-xl sm:px-8 sm:py-5 sm:text-2xl ${stepComplete ? "is-success" : ""}`}
          >
            {successLabel(step.buttonLabel ?? "Double-click me", stepComplete)}
          </button>
        </div>
      );

    case "selectFile":
      return (
        <div className="task-panel task-list">
          {(step.options ?? []).map((file) => (
            <button
              key={file}
              type="button"
              onClick={() => {
                setSelectedFile(file);
                if (file === step.expected) succeed();
                else fail();
              }}
              className={`task-option ${selectedFile === file ? "is-selected" : ""} ${stepComplete && file === step.expected ? "is-success" : ""}`}
            >
              {step.theme === "playground" ? `${SNACK_EMOJI[file] ?? "🍎"} ${file}` : `📄 ${file}`}
            </button>
          ))}
        </div>
      );

    case "deleteFile":
      return (
        <div className="task-panel task-list">
          {visibleFiles.map((file) => (
            <div key={file} className="file-row">
              <span className="text-base font-medium sm:text-lg">📄 {file}</span>
              <button
                type="button"
                onClick={() => {
                  if (file === step.expected) {
                    setVisibleFiles((current) => current.filter((item) => item !== file));
                    succeed();
                  } else {
                    fail();
                  }
                }}
                className="task-button warn px-3 py-2 text-sm sm:px-4"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      );

    case "openFolder":
      return (
        <div className="task-panel task-list">
          {(step.options ?? []).map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => {
                if (folder === step.expected) succeed();
                else fail();
              }}
              className={`task-option ${stepComplete && folder === step.expected ? "is-success" : ""}`}
            >
              📁 {folder}
            </button>
          ))}
        </div>
      );

    case "dragDrop":
      if (step.theme === "playground") {
        const dropKind = getPlayDropKind(step.dropLabel);
        const dropLabelText = step.dropLabel === "Basket" ? "Basket" : step.dropLabel === "Pot" ? "Flower pot" : "Toy box";

        return (
          <div className="task-panel task-panel--play-drop">
            <div
              draggable
              onDragStart={() => setDraggedItem(step.dragItem ?? "Toy")}
              className="drag-item drag-item--play drag-item--toy"
            >
              <span className="drag-item__emoji" aria-hidden="true">{step.themeEmoji ?? "🧸"}</span>
              <span className="drag-item__name">{step.dragItem ?? "Toy"}</span>
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedItem === step.dragItem) {
                  setDropReady(true);
                  succeed();
                } else {
                  fail();
                }
              }}
              className={`drop-zone drop-zone--play-target ${dropReady ? "is-ready" : ""} ${stepComplete ? "is-success" : ""}`}
              aria-label={dropLabelText}
            >
              <PlayDropTarget kind={dropKind} label={dropLabelText} ready={dropReady || stepComplete} />
            </div>
          </div>
        );
      }

      return (
        <div className="task-panel grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div
            draggable
            onDragStart={() => setDraggedItem(step.dragItem ?? "File")}
            className="drag-item"
          >
            📄 {step.dragItem ?? "File"}
          </div>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedItem === step.dragItem) {
                setDropReady(true);
                succeed();
              } else {
                fail();
              }
            }}
            className={`drop-zone ${dropReady ? "is-ready" : ""} ${stepComplete ? "is-success" : ""}`}
          >
            📁 {step.dropLabel ?? "Folder"}
          </div>
        </div>
      );

    case "scroll":
      return (
        <div className="task-panel">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`scroll-practice ${step.theme === "treasure" ? "scroll-practice--treasure" : ""}`}
          >
            <p className="scroll-note">
              {step.theme === "treasure" ? "Keep scrolling to find the treasure…" : "Scroll down to continue…"}
            </p>
            {Array.from({ length: 8 }).map((_, index) => (
              <p key={index} className="scroll-filler">
                {step.theme === "treasure"
                  ? "Keep going — the gold star is further down."
                  : `Keep scrolling — you are looking for the ${step.scrollTarget} button.`}
              </p>
            ))}
            {step.theme === "treasure" ? (
              <button
                type="button"
                onClick={() => {
                  if (scrollReached) succeed();
                  else fail();
                }}
                className={`play-star play-star--scroll mt-4 ${stepComplete ? "is-success" : ""}`}
                aria-label={step.scrollTarget ?? "Gold star"}
              >
                <span className="play-star__icon" aria-hidden="true">⭐</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (scrollReached) succeed();
                  else fail();
                }}
                className={`task-button secondary mt-4 ${stepComplete ? "is-success" : ""}`}
              >
                {successLabel(step.scrollTarget ?? "Continue", stepComplete)}
              </button>
            )}
          </div>
        </div>
      );

    case "typeText":
      return (
        <div className="task-panel space-y-4">
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={step.expected === "your-name" ? "Type your name" : "Type here"}
            className={`task-input ${stepComplete ? "is-success" : ""}`}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() =>
              checkTyped(
                inputValue,
                step.expected,
                step.expected === "your-name" ? "your-name" : undefined,
              )
            }
            className="task-button"
            disabled={stepComplete}
          >
            Check answer
          </button>
        </div>
      );

    case "deleteText":
      return (
        <div className="task-panel space-y-4">
          <input
            value={inputValue || step.target || "computer"}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                const current = inputValue || step.target || "computer";
                setInputValue(current.slice(0, -1));
              }
            }}
            className={`task-input ${stepComplete ? "is-success" : ""}`}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => checkTyped(inputValue || step.target || "computer", step.expected)}
            className="task-button"
            disabled={stepComplete}
          >
            Check answer
          </button>
        </div>
      );

    case "pressEnter":
      return (
        <div className="task-panel space-y-4">
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") checkTyped(inputValue, step.expected);
            }}
            placeholder="Type here and press Enter"
            className={`task-input ${stepComplete ? "is-success" : ""}`}
            autoComplete="off"
            spellCheck={false}
          />
          <p className="task-hint-inline">Press Enter on your keyboard when you have typed the answer.</p>
        </div>
      );

    case "openBrowser":
      return (
        <div className="task-panel flex justify-center py-6 sm:py-8">
          <button
            type="button"
            onClick={() => { setBrowserOpen(true); succeed(); }}
            className={`task-button px-6 py-4 text-xl sm:px-8 sm:py-5 sm:text-2xl ${stepComplete ? "is-success" : ""}`}
          >
            {successLabel("Open browser", stepComplete)}
          </button>
        </div>
      );

    case "browserAddress":
      return (
        <div className="task-panel space-y-4">
          <div className="browser-window">
            <div className="browser-bar">
              <span className="browser-dot" />
              <span className="browser-dot" />
              <span className="browser-dot" />
              <div className="browser-address">{browserOpen ? "Address bar" : "Browser closed"}</div>
            </div>
          </div>
          <input
            value={browserAddress}
            onChange={(event) => setBrowserAddress(event.target.value)}
            placeholder={`Type ${step.expected ?? "address"}`}
            className={`task-input ${stepComplete ? "is-success" : ""}`}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={() => checkTyped(browserAddress, step.expected)} className="task-button" disabled={stepComplete}>
            Go to website
          </button>
        </div>
      );

    case "searchInternet":
      return (
        <div className="task-panel space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search the web"
              className="task-input flex-1"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => {
                if (searchTerm.trim().toLowerCase() === (step.searchQuery ?? step.expected ?? "").toLowerCase()) {
                  setSearchDone(true);
                  succeed();
                } else {
                  fail();
                }
              }}
              className={`task-button warn sm:shrink-0 ${stepComplete ? "is-success" : ""}`}
            >
              {successLabel("Search", stepComplete)}
            </button>
          </div>
          {searchDone && (
            <p className="task-hint-inline">Search results are ready. Click Next step to continue.</p>
          )}
        </div>
      );

    case "clickLink":
      return (
        <div className="task-panel task-list">
          {(step.linkLabel ? [step.linkLabel, "Other result", "More results"] : ["Result"]).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (label === step.linkLabel) succeed();
                else fail();
              }}
              className={`task-option ${stepComplete && label === step.linkLabel ? "is-success" : ""}`}
            >
              🔗 {label}
            </button>
          ))}
        </div>
      );

    case "browserBack":
      return (
        <div className="task-panel space-y-4">
          <div className="browser-toolbar">
            <button
              type="button"
              disabled={historyIndex <= 0}
              onClick={() => {
                setHistoryIndex((current) => Math.max(0, current - 1));
                succeed();
              }}
              className={`task-button secondary btn-compact ${stepComplete ? "is-success" : ""}`}
            >
              {successLabel("← Back", stepComplete)}
            </button>
            <button type="button" disabled className="task-button secondary btn-compact opacity-50">
              Forward →
            </button>
          </div>
          <p className="browser-page-label">Current page: {pageHistory[historyIndex]}</p>
        </div>
      );

    case "browserForward":
      return (
        <div className="task-panel space-y-4">
          <div className="browser-toolbar">
            <button type="button" disabled className="task-button secondary btn-compact opacity-50">
              ← Back
            </button>
            <button
              type="button"
              disabled={historyIndex >= pageHistory.length - 1}
              onClick={() => {
                setHistoryIndex((current) => Math.min(pageHistory.length - 1, current + 1));
                succeed();
              }}
              className={`task-button secondary btn-compact ${stepComplete ? "is-success" : ""}`}
            >
              {successLabel("Forward →", stepComplete)}
            </button>
          </div>
          <p className="browser-page-label">Current page: {pageHistory[historyIndex]}</p>
        </div>
      );

    case "downloadAttachment":
    case "openInbox":
    case "openEmail":
    case "backToInbox":
    case "replyEmail":
    case "composeEmail":
      return (
        <div className="task-panel">
          <EmailClient
            step={step}
            stepComplete={stepComplete}
            onSuccess={succeed}
            onError={fail}
          />
        </div>
      );

    case "uploadFile":
      return (
        <div className="task-panel">
          <label className={`upload-label ${stepComplete ? "is-success" : ""}`}>
            <input
              type="file"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                if (!isFileSafeForUpload(file)) {
                  fail();
                  return;
                }

                const uploaded = await uploadFileToWorker(file);
                if (!uploaded) {
                  fail();
                  return;
                }

                setUploadedFileName(file.name);
                succeed();
              }}
            />
            <span className="upload-icon">
              <FontAwesomeIcon icon={faFileArrowUp} />
            </span>
            {uploadedFileName ? `Chosen: ${uploadedFileName}` : "Select a file from your computer"}
          </label>
        </div>
      );

    default:
      return <div className="task-panel text-lg">Practice task ready.</div>;
  }
}
