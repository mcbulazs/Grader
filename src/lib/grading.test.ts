import { describe, expect, it } from "vitest";
import {
  DEFAULT_CUTOFFS as C,
  gradeFor,
  parseNumber,
  percent,
  percentRanges,
  pointRanges,
  pointsToNextGrade,
  testStats,
  validateCutoffs,
} from "./grading";

describe("percent / gradeFor", () => {
  it("rounds to one decimal like the old app", () => {
    expect(percent(1, 3)).toBe(33.3);
    expect(percent(2, 3)).toBe(66.7);
    expect(percent(0, 0)).toBe(0);
  });

  it("treats cutoffs as the top of each grade", () => {
    expect(gradeFor(34, 100, C).grade).toBe(1);
    expect(gradeFor(35, 100, C).grade).toBe(2);
    expect(gradeFor(54, 100, C).grade).toBe(2);
    expect(gradeFor(89, 100, C).grade).toBe(4);
    expect(gradeFor(89.5, 100, C).grade).toBe(5);
    expect(gradeFor(100, 100, C).grade).toBe(5);
  });

  it("compares the rounded percentage", () => {
    // 34.04% is shown as 34% and is a 1
    expect(gradeFor(34.04, 100, C)).toEqual({ pct: 34, grade: 1 });
  });
});

describe("pointRanges", () => {
  it("matches gradeFor for every score", () => {
    for (const max of [7, 20, 43, 50, 100]) {
      const r = pointRanges(max, C);
      for (let p = 0; p <= max; p++) {
        const g = gradeFor(p, max, C).grade;
        expect(r[g]!.min).toBeLessThanOrEqual(p);
        expect(r[g]!.max).toBeGreaterThanOrEqual(p);
      }
    }
  });

  it("gives the classic ranges for 50 points", () => {
    expect(pointRanges(50, C)).toEqual({
      1: { min: 0, max: 17 },
      2: { min: 18, max: 27 },
      3: { min: 28, max: 37 },
      4: { min: 38, max: 44 },
      5: { min: 45, max: 50 },
    });
  });

  it("supports half points", () => {
    const r = pointRanges(10, C, 0.5);
    expect(r[1]).toEqual({ min: 0, max: 3 });
    expect(r[2]).toEqual({ min: 3.5, max: 5 });
    expect(r[5]).toEqual({ min: 9, max: 10 });
  });

  it("marks unreachable grades as null", () => {
    const r = pointRanges(2, C);
    expect(r[1]).toEqual({ min: 0, max: 0 });
    expect(r[2]).toEqual({ min: 1, max: 1 });
    expect(r[3]).toBeNull();
    expect(r[4]).toBeNull();
    expect(r[5]).toEqual({ min: 2, max: 2 });
  });
});

describe("pointsToNextGrade", () => {
  it("counts the missing points", () => {
    expect(pointsToNextGrade(40, 50, C)).toEqual({ grade: 5, missing: 5 });
    expect(pointsToNextGrade(50, 50, C)).toBeNull();
  });
});

describe("percentRanges", () => {
  it("shows where each grade starts", () => {
    const r = percentRanges(C);
    expect(r[1]).toEqual({ from: 0, to: 34 });
    expect(r[2]).toEqual({ from: 34.1, to: 54 });
    expect(r[5]).toEqual({ from: 89.1, to: 100 });
  });
});

describe("validateCutoffs", () => {
  it("accepts the default", () => expect(validateCutoffs(C)).toBeNull());
  it("rejects out-of-order cutoffs", () =>
    expect(validateCutoffs([34, 30, 74, 89])).toBe("A 2-es határa legyen nagyobb, mint az 1-esé."));
  it("rejects 100 and above", () => expect(validateCutoffs([34, 54, 74, 100])).not.toBeNull());
  it("rejects empty values", () => expect(validateCutoffs([34, NaN, 74, 89])).not.toBeNull());
});

describe("testStats", () => {
  it("summarises a test", () => {
    const s = testStats([10, 20, 30, 40, 50], 50, C)!;
    expect(s.distribution).toEqual({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
    expect(s.avgPoints).toBe(30);
    expect(s.avgGrade).toBe(3);
    expect(s.median).toBe(30);
    expect(s.passRate).toBe(0.8);
  });
  it("returns null when empty", () => expect(testStats([], 50, C)).toBeNull());
});

describe("parseNumber", () => {
  it("accepts comma and dot decimals", () => {
    expect(parseNumber("23,5")).toBe(23.5);
    expect(parseNumber(" 23.5 ")).toBe(23.5);
    expect(parseNumber("7")).toBe(7);
  });
  it("rejects junk", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("-3")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});
