// Grading rules, kept identical to the original app:
// - the percentage is rounded to one decimal place,
// - each cutoff is the highest percentage that still gets that grade
//   (default 34 / 54 / 74 / 89: 0–34% → 1, 34,1–54% → 2, … 89,1–100% → 5).

export type Grade = 1 | 2 | 3 | 4 | 5;
/** Upper percentage bound (inclusive) of grades 1, 2, 3 and 4. */
export type Cutoffs = [number, number, number, number];

export const GRADES: Grade[] = [1, 2, 3, 4, 5];
export const DEFAULT_CUTOFFS: Cutoffs = [34, 54, 74, 89];

export const GRADE_NAMES: Record<Grade, string> = {
  1: "elégtelen",
  2: "elégséges",
  3: "közepes",
  4: "jó",
  5: "jeles",
};

export function percent(points: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((points / max) * 1000) / 10;
}

export function gradeForPercent(pct: number, cutoffs: Cutoffs): Grade {
  for (let i = 0; i < 4; i++) {
    if (pct <= cutoffs[i]) return (i + 1) as Grade;
  }
  return 5;
}

export function gradeFor(points: number, max: number, cutoffs: Cutoffs) {
  const pct = percent(points, max);
  return { pct, grade: gradeForPercent(pct, cutoffs) };
}

/** Returns a Hungarian error message, or null if the cutoffs are usable. */
export function validateCutoffs(c: number[]): string | null {
  if (c.length !== 4 || c.some((v) => !Number.isFinite(v))) {
    return "Minden határt ki kell tölteni.";
  }
  if (c.some((v) => v < 0 || v >= 100)) {
    return "A határok 0 és 100% közé essenek (a 100% mindig 5-ös).";
  }
  for (let i = 1; i < 4; i++) {
    if (c[i] <= c[i - 1]) {
      const hi = (i + 1) as Grade;
      const lo = i as Grade;
      const a = article(hi);
      return `${a[0].toUpperCase()}${a.slice(1)} ${gradeLabel(hi)} határa legyen nagyobb, mint ${article(lo)} ${gradeLabel(lo)}é.`;
    }
  }
  return null;
}

export type Range = { min: number; max: number } | null;

/** Percentage range shown for each grade, e.g. 2 → 34,1–54. */
export function percentRanges(cutoffs: Cutoffs): Record<Grade, { from: number; to: number }> {
  const bounds = [-0.1, ...cutoffs, 100];
  const out = {} as Record<Grade, { from: number; to: number }>;
  GRADES.forEach((g, i) => {
    out[g] = { from: Math.round((bounds[i] + 0.1) * 10) / 10, to: bounds[i + 1] };
  });
  return out;
}

/**
 * Point range that earns each grade, found by trying every possible score
 * (whole or half points), so it always agrees with gradeFor().
 * A grade nobody can get (e.g. on a very short test) is null.
 */
export function pointRanges(max: number, cutoffs: Cutoffs, step: 1 | 0.5 = 1): Record<Grade, Range> {
  const out: Record<Grade, Range> = { 1: null, 2: null, 3: null, 4: null, 5: null };
  if (!(max > 0)) return out;
  const steps = Math.floor(max / step + 1e-9);
  const scores: number[] = [];
  for (let k = 0; k <= steps; k++) scores.push(k * step);
  if (scores[scores.length - 1] < max) scores.push(max);
  for (const p of scores) {
    const g = gradeForPercent(percent(p, max), cutoffs);
    const r = out[g];
    if (r) r.max = p;
    else out[g] = { min: p, max: p };
  }
  return out;
}

/** Points still missing for the next grade, or null at grade 5 / if unreachable. */
export function pointsToNextGrade(points: number, max: number, cutoffs: Cutoffs, step: 1 | 0.5 = 1) {
  const { grade } = gradeFor(points, max, cutoffs);
  const ranges = pointRanges(max, cutoffs, step);
  for (let g = grade + 1; g <= 5; g++) {
    const r = ranges[g as Grade];
    if (r) return { grade: g as Grade, missing: Math.round((r.min - points) * 10) / 10 };
  }
  return null;
}

export type Stats = {
  count: number;
  avgPoints: number;
  avgPct: number;
  avgGrade: number;
  median: number;
  passRate: number;
  distribution: Record<Grade, number>;
};

export function testStats(scores: number[], max: number, cutoffs: Cutoffs): Stats | null {
  if (scores.length === 0 || !(max > 0)) return null;
  const distribution: Record<Grade, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumPoints = 0;
  let sumGrade = 0;
  for (const s of scores) {
    const { grade } = gradeFor(s, max, cutoffs);
    distribution[grade]++;
    sumPoints += s;
    sumGrade += grade;
  }
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const n = scores.length;
  return {
    count: n,
    avgPoints: sumPoints / n,
    avgPct: percent(sumPoints / n, max),
    avgGrade: sumGrade / n,
    median,
    passRate: (n - distribution[1]) / n,
    distribution,
  };
}

/** Accepts "23", "23,5", "23.5" and " 23 ". Returns null for anything else. */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(",", ".");
  if (s === "" || !/^\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

const nf = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("hu-HU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmt = (n: number) => nf.format(n);
export const fmt2 = (n: number) => nf2.format(n);

/** Hungarian suffix for a grade: 1-es, 2-es, 3-as, 4-es, 5-ös. */
export const gradeLabel = (g: Grade) => `${g}-${g === 3 ? "as" : g === 5 ? "ös" : "es"}`;

/** "az" before 1 (egy) and 5 (öt), "a" otherwise. */
export const article = (g: Grade) => (g === 1 || g === 5 ? "az" : "a");

/** "-hoz/-hez/-höz" form: 1-eshez, 3-ashoz, 5-öshöz. */
export const gradeTo = (g: Grade) => gradeLabel(g) + (g === 3 ? "hoz" : g === 5 ? "höz" : "hez");
