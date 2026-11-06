"use client";

// Everything is kept in this browser only (localStorage): no accounts, and
// no student data ever leaves the device.

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_CUTOFFS, validateCutoffs, type Cutoffs } from "./grading";

export type Preset = { id: string; name: string; cutoffs: Cutoffs };
export type Settings = { presets: Preset[]; activeId: string; halfPoints: boolean };

export const DEFAULT_PRESET: Preset = { id: "default", name: "Alapértelmezett", cutoffs: DEFAULT_CUTOFFS };
const DEFAULT_SETTINGS: Settings = { presets: [DEFAULT_PRESET], activeId: "default", halfPoints: false };

export type TestDraft = { title: string; max: string; scores: string[] };
const DEFAULT_DRAFT: TestDraft = { title: "", max: "", scores: [""] };

function isCutoffs(v: unknown): v is Cutoffs {
  return Array.isArray(v) && validateCutoffs(v as number[]) === null;
}

function sanitizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const r = raw as Partial<Settings>;
  const presets = (Array.isArray(r.presets) ? r.presets : []).filter(
    (p): p is Preset => !!p && typeof p.id === "string" && typeof p.name === "string" && isCutoffs(p.cutoffs),
  );
  if (presets.length === 0) presets.push(DEFAULT_PRESET);
  const activeId = presets.some((p) => p.id === r.activeId) ? r.activeId! : presets[0].id;
  return { presets, activeId, halfPoints: r.halfPoints === true };
}

function sanitizeDraft(raw: unknown): TestDraft {
  if (!raw || typeof raw !== "object") return DEFAULT_DRAFT;
  const r = raw as Partial<TestDraft>;
  const scores = Array.isArray(r.scores) ? r.scores.filter((s) => typeof s === "string") : [];
  return {
    title: typeof r.title === "string" ? r.title : "",
    max: typeof r.max === "string" ? r.max : "",
    scores: scores.length ? scores : [""],
  };
}

// A tiny localStorage-backed store that React can subscribe to. The server
// render (and the first client render) use the defaults, then the saved
// values take over, so hydration never mismatches.
function createStore<T>(key: string, fallback: T, sanitize: (raw: unknown) => T) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? sanitize(JSON.parse(raw)) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };

  const write = (next: T) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private mode or full storage: keep working in memory.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  return function useStore() {
    const value = useSyncExternalStore(subscribe, read, () => fallback);
    const update = useCallback((fn: (prev: T) => T) => write(fn(read())), []);
    return [value, update] as const;
  };
}

export const useSettings = createStore("grader:settings:v1", DEFAULT_SETTINGS, sanitizeSettings);
export const useTestDraft = createStore("grader:test:v1", DEFAULT_DRAFT, sanitizeDraft);

export function useActivePreset() {
  const [settings, update] = useSettings();
  const preset = settings.presets.find((p) => p.id === settings.activeId) ?? settings.presets[0];
  return { settings, update, preset, step: (settings.halfPoints ? 0.5 : 1) as 1 | 0.5 };
}

export const newId = () => Math.random().toString(36).slice(2, 10);

// Share links: /savok?sav=<name>~34~54~74~89
export function encodePreset(p: Preset): string {
  return [p.name, ...p.cutoffs].map(encodeURIComponent).join("~");
}

export function decodePreset(s: string): Omit<Preset, "id"> | null {
  const parts = s.split("~").map((x) => {
    try {
      return decodeURIComponent(x);
    } catch {
      return "";
    }
  });
  if (parts.length !== 5) return null;
  const name = parts[0].trim().slice(0, 60);
  const cutoffs = parts.slice(1).map(Number);
  if (!name || !isCutoffs(cutoffs)) return null;
  return { name, cutoffs: cutoffs as Cutoffs };
}
