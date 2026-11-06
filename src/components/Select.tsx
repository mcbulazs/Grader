"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** detail shows in the button and the list; extra only in the list. */
export type SelectOption = { value: string; label: string; detail?: ReactNode; extra?: ReactNode };

/** Accessible custom dropdown (listbox pattern) styled to match the app. */
export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  id,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };
  const choose = (i: number) => {
    onChange(options[i].value);
    close();
  };

  // Close when clicking or tapping outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Move focus into the list and keep the active option visible.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(last, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => close(),
      Tab: () => close(false),
    };
    const fn = keys[e.key];
    if (fn) {
      if (e.key !== "Tab") e.preventDefault();
      fn();
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block max-w-full">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={`group flex max-w-full items-center gap-2 rounded-xl border bg-surface py-1.5 pr-2.5 pl-3 text-left font-medium text-text transition hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-accent/25 focus-visible:outline-none ${
          open ? "border-accent ring-4 ring-accent/15" : "border-border"
        }`}
      >
        <span className="truncate">{selected?.label}</span>
        {selected?.detail && <span className="hidden shrink-0 text-muted sm:inline">{selected.detail}</span>}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          className="absolute top-full left-0 z-30 mt-2 max-h-72 w-max max-w-[min(22rem,calc(100vw-2rem))] min-w-full overflow-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/10 outline-none"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${i === active ? "bg-surface-2" : ""}`}
              >
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${isSelected ? "font-semibold text-accent" : "font-medium"}`}>{o.label}</span>
                  {o.detail && <span className="mt-0.5 block text-sm text-muted">{o.detail}</span>}
                  {o.extra && <span className="mt-2 block">{o.extra}</span>}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`shrink-0 text-accent ${isSelected ? "" : "invisible"}`}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
