"use client";

import { useEffect, useId, useState } from "react";
import { searchPlaces, type PlaceResult } from "./place-search";

export function PlaceLookup({
  id,
  name,
  label,
  hideLabel = false,
  placeholder = "Start typing an address or postcode",
  value,
  onChange,
  onPlace,
}: {
  id: string;
  name?: string;
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onPlace?: (place: PlaceResult) => void;
}) {
  const listId = useId();
  const [local, setLocal] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [active, setActive] = useState(-1);
  const text = value ?? local;

  const setText = (next: string) => {
    if (value === undefined) setLocal(next);
    onChange?.(next);
  };

  useEffect(() => {
    const query = text.trim();
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchPlaces(query, controller.signal).then((found) => {
        if (!controller.signal.aborted) {
          setResults(found);
          setActive(-1);
        }
      });
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [text]);

  const shown = text.trim().length < 2 || !open ? [] : results;

  const choose = (place: PlaceResult) => {
    setText(onPlace ? place.label : place.search);
    onPlace?.(place);
    setOpen(false);
  };

  return (
    <div className="wj-field wj-lookup">
      <label htmlFor={id} className={hideLabel ? "wj-visually-hidden" : undefined}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown.length > 0}
        aria-controls={listId}
        autoComplete="off"
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((index) => Math.min(index + 1, shown.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && active >= 0 && shown[active]) {
            event.preventDefault();
            choose(shown[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {shown.length > 0 ? (
        <ul id={listId} className="wj-lookup__list" role="listbox">
          {shown.map((place, index) => (
            <li key={place.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                className={index === active ? "is-active" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(place)}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
