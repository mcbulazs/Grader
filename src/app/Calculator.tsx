"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { GRADE_CLASS, HalfPointsToggle, PresetPicker, RangesTable } from "@/components/grade-ui";
import { article, fmt, GRADE_NAMES, gradeFor, gradeTo, parseNumber, pointsToNextGrade } from "@/lib/grading";
import { useActivePreset } from "@/lib/store";

export default function Calculator() {
  const { preset, step } = useActivePreset();
  const [maxText, setMaxText] = useState("");
  const [pointsText, setPointsText] = useState("");
  const maxRef = useRef<HTMLInputElement>(null);
  const pointsRef = useRef<HTMLInputElement>(null);

  const max = parseNumber(maxText);
  const points = parseNumber(pointsText);
  const maxError = maxText.trim() && (max === null || max <= 0) ? "Adj meg egy pozitív számot." : null;
  const pointsError =
    pointsText.trim() && points === null
      ? "Adj meg egy számot."
      : max && points !== null && points > max
        ? "Az elért pont nem lehet több az összpontnál."
        : null;

  const result = max && max > 0 && points !== null && !pointsError ? gradeFor(points, max, preset.cutoffs) : null;
  const next = result && max ? pointsToNextGrade(points!, max, preset.cutoffs, step) : null;

  const selectPoints = () => {
    pointsRef.current?.focus();
    pointsRef.current?.select();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <section className="card flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gyors számoló</h1>
          <div className="mt-2">
            <PresetPicker />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="max" className="label">
              Összpont
            </label>
            <input
              id="max"
              ref={maxRef}
              autoFocus
              inputMode="decimal"
              autoComplete="off"
              placeholder="pl. 50"
              value={maxText}
              onChange={(e) => setMaxText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  selectPoints();
                }
              }}
              aria-invalid={!!maxError}
              aria-describedby={maxError ? "max-error" : undefined}
              className={`field tabular text-2xl ${maxError ? "field-invalid" : ""}`}
            />
          </div>
          <div>
            <label htmlFor="points" className="label">
              Elért pont
            </label>
            <input
              id="points"
              ref={pointsRef}
              inputMode="decimal"
              autoComplete="off"
              placeholder="pl. 38"
              value={pointsText}
              onChange={(e) => setPointsText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!max) maxRef.current?.focus();
                  else selectPoints();
                } else if (e.key === "Escape") {
                  setPointsText("");
                }
              }}
              aria-invalid={!!pointsError}
              aria-describedby={pointsError ? "points-error" : undefined}
              className={`field tabular text-2xl ${pointsError ? "field-invalid" : ""}`}
            />
          </div>
          {(maxError || pointsError) && (
            <p id={maxError ? "max-error" : "points-error"} role="alert" className="col-span-2 -mt-1 text-sm text-danger">
              {maxError ?? pointsError}
            </p>
          )}
        </div>

        <div
          aria-live="polite"
          className={`flex min-h-36 items-center gap-5 rounded-2xl p-5 transition-colors ${
            result ? GRADE_CLASS[result.grade].soft : "bg-surface-2"
          }`}
        >
          {result ? (
            <>
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-5xl font-bold text-white tabular ${
                  GRADE_CLASS[result.grade].bg
                }`}
              >
                {result.grade}
              </div>
              <div className="min-w-0">
                <div className={`text-4xl font-semibold tracking-tight tabular ${GRADE_CLASS[result.grade].text}`}>
                  {fmt(result.pct)}%
                </div>
                <div className="mt-0.5 text-lg font-medium">{GRADE_NAMES[result.grade]}</div>
                {next && (
                  <div className="mt-1 text-sm text-muted">
                    {article(next.grade)[0].toUpperCase() + article(next.grade).slice(1)} {gradeTo(next.grade)} még{" "}
                    <strong className="text-text">{fmt(next.missing)}</strong> pont kellett volna.
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted">Írd be az összpontot és az elért pontot, és itt megjelenik a jegy.</p>
          )}
        </div>

        <p className="hidden text-sm text-muted sm:block">
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Enter</kbd> – következő tanuló
          (kijelöli az elért pontot) ·{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Esc</kbd> – törlés ·{" "}
          Egész osztályt javítasz?{" "}
          <Link href="/dolgozat" className="font-medium text-accent underline-offset-4 hover:underline">
            Dolgozat
          </Link>
        </p>
      </section>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Ponthatárok{max ? ` ${fmt(max)} pontból` : ""}</h2>
          <HalfPointsToggle />
        </div>
        <RangesTable max={max && max > 0 ? max : null} cutoffs={preset.cutoffs} step={step} highlight={result?.grade} />
        {!max && <p className="mt-3 text-sm text-muted">Az összpont megadása után itt látod, hány pont kell az egyes jegyekhez.</p>}
      </section>
    </div>
  );
}
