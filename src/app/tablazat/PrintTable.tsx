"use client";

import { useState } from "react";
import { CutoffBar, GradeBadge, HalfPointsToggle, PresetPicker, RangesTable } from "@/components/grade-ui";
import { fmt, gradeFor, parseNumber, type Cutoffs } from "@/lib/grading";
import { useActivePreset } from "@/lib/store";

export default function PrintTable() {
  const { preset, step } = useActivePreset();
  const [title, setTitle] = useState("");
  const [maxes, setMaxes] = useState<string[]>(["50"]);
  const [showPercent, setShowPercent] = useState(true);
  const [everyScore, setEveryScore] = useState(false);

  const tables = maxes
    .map((t) => parseNumber(t))
    .filter((m): m is number => m !== null && m > 0 && m <= 1000);

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ponttáblázat</h1>
        <p className="mt-1 text-muted">Nyomtasd ki a dolgozat mellé, vagy tedd ki a tanulóknak.</p>
      </div>

      <section className="no-print card flex flex-col gap-5">
        <PresetPicker />
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="title" className="label">
              Cím (nem kötelező)
            </label>
            <input
              id="title"
              className="field"
              placeholder="pl. 8. évfolyam – Témazáró"
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <span className="label">Összpont</span>
            <div className="flex flex-wrap items-center gap-2">
              {maxes.map((m, i) => (
                <span key={i} className="flex items-center">
                  <input
                    aria-label={`${i + 1}. összpont`}
                    className={`field w-24 tabular ${m.trim() && !(parseNumber(m)! > 0) ? "field-invalid" : ""}`}
                    inputMode="decimal"
                    value={m}
                    onChange={(e) => setMaxes((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  {maxes.length > 1 && (
                    <button
                      className="ml-1 rounded-lg px-2 py-1 text-muted hover:text-danger"
                      aria-label={`${i + 1}. összpont törlése`}
                      onClick={() => setMaxes((xs) => xs.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {maxes.length < 6 && (
                <button className="btn" onClick={() => setMaxes((xs) => [...xs, ""])}>
                  + Másik
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <HalfPointsToggle />
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
            <input type="checkbox" checked={showPercent} onChange={(e) => setShowPercent(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Százalékok is
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
            <input type="checkbox" checked={everyScore} onChange={(e) => setEveryScore(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Minden pontszám külön
          </label>
          <button className="btn btn-primary ml-auto" onClick={() => window.print()} disabled={!tables.length}>
            Nyomtatás
          </button>
        </div>
      </section>

      {title.trim() && <h2 className="hidden text-2xl font-semibold print:block">{title}</h2>}

      <div className={`grid gap-6 sm:grid-cols-2 print:gap-10 ${tables.length > 1 ? "print:grid-cols-2" : "print:grid-cols-1"}`}>
        {tables.map((max, i) => (
          <section key={i} className="card break-inside-avoid">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold">{title.trim() && tables.length === 1 ? title : `${fmt(max)} pontos dolgozat`}</h3>
              <span className="text-sm text-muted">{preset.cutoffs.join(" / ")}%</span>
            </div>
            <div className="mb-4">
              <CutoffBar cutoffs={preset.cutoffs} />
            </div>
            {everyScore ? <EveryScore max={max} step={step} cutoffs={preset.cutoffs} showPercent={showPercent} /> : <RangesTable max={max} cutoffs={preset.cutoffs} step={step} showPercent={showPercent} />}
          </section>
        ))}
      </div>
    </div>
  );

}

function EveryScore({ max, step, cutoffs, showPercent }: { max: number; step: 1 | 0.5; cutoffs: Cutoffs; showPercent: boolean }) {
  const scores: number[] = [];
  for (let p = max; p >= 0; p -= step) scores.push(Math.round(p * 10) / 10);
  if (scores[scores.length - 1] !== 0) scores.push(0);
  return (
    <div className="columns-3 gap-4 text-sm tabular sm:columns-4 print:columns-4">
      {scores.map((p) => {
        const r = gradeFor(p, max, cutoffs);
        return (
          <div key={p} className="flex break-inside-avoid items-center justify-between gap-2 border-b border-border py-1">
            <span className="font-medium">{fmt(p)}</span>
            {showPercent && <span className="hidden text-xs text-muted sm:inline">{fmt(r.pct)}%</span>}
            <GradeBadge grade={r.grade} size="sm" />
          </div>
        );
      })}
    </div>
  );
}
