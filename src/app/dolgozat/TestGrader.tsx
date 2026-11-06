"use client";

import { useEffect, useRef, useState } from "react";
import { GRADE_CLASS, GradeBadge, HalfPointsToggle, PresetPicker, RangesTable } from "@/components/grade-ui";
import { fmt, fmt2, GRADE_NAMES, GRADES, gradeFor, parseNumber, testStats } from "@/lib/grading";
import { useActivePreset, useTestDraft } from "@/lib/store";

export default function TestGrader() {
  const { preset, step } = useActivePreset();
  const [draft, setDraft] = useTestDraft();
  const rowRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const max = parseNumber(draft.max);
  const validMax = max !== null && max > 0 ? max : null;
  const rows = draft.scores.map((text) => {
    const p = parseNumber(text);
    const error = text.trim() === "" ? null : p === null ? "Nem szám" : validMax !== null && p > validMax ? "Több az összpontnál" : null;
    const result = p !== null && !error && validMax ? gradeFor(p, validMax, preset.cutoffs) : null;
    return { text, points: p, error, result };
  });
  const valid = rows.filter((r) => r.result).map((r) => r.points!);
  const stats = validMax ? testStats(valid, validMax, preset.cutoffs) : null;

  useEffect(() => {
    if (pendingFocus.current !== null) {
      const el = rowRefs.current[pendingFocus.current];
      el?.focus();
      el?.select();
      pendingFocus.current = null;
    }
  });

  const setScores = (fn: (s: string[]) => string[], focus?: number) => {
    if (focus !== undefined) pendingFocus.current = focus;
    setDraft((d) => {
      const scores = fn(d.scores);
      return { ...d, scores: scores.length ? scores : [""] };
    });
  };

  const onRowKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || (e.key === "ArrowDown" && i < draft.scores.length - 1)) {
      e.preventDefault();
      if (i === draft.scores.length - 1) setScores((s) => [...s, ""], i + 1);
      else {
        rowRefs.current[i + 1]?.focus();
        rowRefs.current[i + 1]?.select();
      }
    } else if (e.key === "ArrowUp" && i > 0) {
      e.preventDefault();
      rowRefs.current[i - 1]?.focus();
      rowRefs.current[i - 1]?.select();
    } else if (e.key === "Backspace" && draft.scores[i] === "" && draft.scores.length > 1) {
      e.preventDefault();
      setScores((s) => s.filter((_, j) => j !== i), Math.max(0, i - 1));
    }
  };

  // Pasting a column from Excel (or "12 15 30") fills several rows at once.
  const onRowPaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const tokens = e.clipboardData.getData("text").split(/[\s;]+/).filter(Boolean);
    if (tokens.length < 2) return;
    e.preventDefault();
    setScores((s) => [...s.slice(0, i), ...tokens, ...s.slice(i + 1)], i + tokens.length - 1);
  };

  const copy = async (kind: "grades" | "table") => {
    const lines =
      kind === "grades"
        ? rows.map((r) => (r.result ? String(r.result.grade) : ""))
        : [
            "Sorszám\tPont\tSzázalék\tJegy",
            ...rows.map((r, i) => (r.result ? `${i + 1}\t${fmt(r.points!)}\t${fmt(r.result.pct)}%\t${r.result.grade}` : `${i + 1}\t\t\t`)),
          ];
    while (kind === "grades" && lines.length && lines[lines.length - 1] === "") lines.pop();
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert("A másolás nem sikerült ebben a böngészőben.");
    }
  };

  const reset = () => {
    if (confirm("Biztosan új dolgozatot kezdesz? A mostani pontok törlődnek.")) {
      pendingFocus.current = null;
      setDraft(() => ({ title: "", max: "", scores: [""] }));
    }
  };

  const filled = rows.some((r) => r.text.trim());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{draft.title.trim() || "Dolgozat javítása"}</h1>
          <div className="mt-2">
            <PresetPicker />
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <button className="btn" onClick={() => copy("grades")} disabled={!stats}>
            {copied === "grades" ? "Kimásolva ✓" : "Jegyek másolása"}
          </button>
          <button className="btn" onClick={() => copy("table")} disabled={!stats}>
            {copied === "table" ? "Kimásolva ✓" : "Táblázat másolása"}
          </button>
          <button className="btn" onClick={() => window.print()} disabled={!stats}>
            Nyomtatás
          </button>
          <button className="btn btn-danger" onClick={reset} disabled={!filled && !draft.max && !draft.title}>
            Új dolgozat
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="card flex flex-col gap-5">
          <div className="no-print grid grid-cols-[1fr_8rem] gap-4">
            <div>
              <label htmlFor="title" className="label">
                Megnevezés (nem kötelező)
              </label>
              <input
                id="title"
                className="field"
                placeholder="pl. 7.b témazáró"
                maxLength={80}
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="max" className="label">
                Összpont
              </label>
              <input
                id="max"
                className={`field tabular ${draft.max.trim() && !validMax ? "field-invalid" : ""}`}
                inputMode="decimal"
                autoComplete="off"
                placeholder="pl. 50"
                value={draft.max}
                onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    rowRefs.current[0]?.focus();
                  }
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-semibold">Elért pontok</h2>
              <span className="text-sm text-muted tabular">{valid.length} tanuló</span>
            </div>
            <p className="no-print mb-3 text-sm text-muted">
              Napló szerinti sorrendben írd be; <kbd className="font-mono text-xs">Enter</kbd> után jön a következő sor. Excelből
              egy egész oszlopot is beilleszthetsz.
            </p>
            <ol className="flex flex-col gap-1.5">
              {rows.map((r, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-7 shrink-0 text-right text-sm text-muted tabular">{i + 1}.</span>
                  <input
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    aria-label={`${i + 1}. tanuló pontja`}
                    className={`field w-24 shrink-0 px-3 py-2 text-base tabular ${r.error ? "field-invalid" : ""}`}
                    inputMode="decimal"
                    autoComplete="off"
                    value={r.text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setScores((s) => s.map((x, j) => (j === i ? v : x)));
                    }}
                    onKeyDown={(e) => onRowKey(i, e)}
                    onPaste={(e) => onRowPaste(i, e)}
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-3 text-sm">
                    {r.error ? (
                      <span className="text-danger">{r.error}</span>
                    ) : r.result ? (
                      <>
                        <GradeBadge grade={r.result.grade} size="sm" />
                        <span className="text-muted tabular">{fmt(r.result.pct)}%</span>
                      </>
                    ) : r.text.trim() && !validMax ? (
                      <span className="text-muted">Add meg az összpontot</span>
                    ) : null}
                  </span>
                  <button
                    className="no-print rounded-lg px-2 py-1 text-muted hover:bg-surface-2 hover:text-danger"
                    aria-label={`${i + 1}. sor törlése`}
                    tabIndex={-1}
                    onClick={() => setScores((s) => s.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
            <button className="no-print btn mt-3" onClick={() => setScores((s) => [...s, ""], draft.scores.length)}>
              + Új sor
            </button>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="card">
            <h2 className="mb-4 font-semibold">Összesítés</h2>
            {stats ? (
              <>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Stat label="Átlag (jegy)" value={fmt2(stats.avgGrade)} strong />
                  <Stat label="Átlag (pont)" value={`${fmt(stats.avgPoints)} / ${fmt(validMax!)}`} />
                  <Stat label="Átlag (%)" value={`${fmt(stats.avgPct)}%`} />
                  <Stat label="Medián (pont)" value={fmt(stats.median)} />
                  <Stat label="Megfelelt" value={`${Math.round(stats.passRate * 100)}%`} />
                  <Stat label="Tanulók" value={String(stats.count)} />
                </dl>
                <div className="mt-6 flex flex-col gap-2.5">
                  {[...GRADES].reverse().map((g) => {
                    const n = stats.distribution[g];
                    const share = n / stats.count;
                    return (
                      <div key={g} className="flex items-center gap-3 text-sm">
                        <GradeBadge grade={g} size="sm" />
                        <span className="w-20 shrink-0 text-muted">{GRADE_NAMES[g]}</span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <div className={`h-full rounded-full ${GRADE_CLASS[g].bg}`} style={{ width: `${share * 100}%` }} />
                        </div>
                        <span className="w-14 shrink-0 text-right font-medium tabular">
                          {n} <span className="font-normal text-muted">db</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Az összpont és az első pontszám után itt látod az átlagot és a jegyek eloszlását.</p>
            )}
          </section>

          <section className="card">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Ponthatárok</h2>
              <HalfPointsToggle />
            </div>
            <RangesTable max={validMax} cutoffs={preset.cutoffs} step={step} />
          </section>
        </div>
      </div>
      <p className="no-print text-sm text-muted">
        A pontok csak ebben a böngészőben maradnak meg (nevek nélkül), amíg nem kezdesz új dolgozatot.
      </p>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">{label}</dt>
      <dd className={`mt-1 tabular ${strong ? "text-3xl font-semibold" : "text-xl font-medium"}`}>{value}</dd>
    </div>
  );
}
