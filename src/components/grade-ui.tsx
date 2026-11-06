"use client";

import Link from "next/link";
import { fmt, GRADE_NAMES, GRADES, percentRanges, pointRanges, type Cutoffs, type Grade } from "@/lib/grading";
import { useActivePreset } from "@/lib/store";
import { Select } from "./Select";

// Static class names so Tailwind can see them.
export const GRADE_CLASS: Record<Grade, { text: string; bg: string; soft: string; ring: string }> = {
  1: { text: "text-g1", bg: "bg-g1", soft: "bg-g1/12", ring: "ring-g1/40" },
  2: { text: "text-g2", bg: "bg-g2", soft: "bg-g2/12", ring: "ring-g2/40" },
  3: { text: "text-g3", bg: "bg-g3", soft: "bg-g3/14", ring: "ring-g3/40" },
  4: { text: "text-g4", bg: "bg-g4", soft: "bg-g4/14", ring: "ring-g4/40" },
  5: { text: "text-g5", bg: "bg-g5", soft: "bg-g5/12", ring: "ring-g5/40" },
};

export function GradeBadge({ grade, size = "md" }: { grade: Grade; size?: "sm" | "md" }) {
  const c = GRADE_CLASS[grade];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold tabular ${c.soft} ${c.text} ${
        size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-base"
      }`}
      title={GRADE_NAMES[grade]}
    >
      {grade}
    </span>
  );
}

/** Coloured 0–100% bar showing where each grade starts. */
export function CutoffBar({ cutoffs }: { cutoffs: Cutoffs }) {
  const bounds = [0, ...cutoffs, 100];
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full" aria-hidden="true">
      {GRADES.map((g, i) => (
        <div key={g} className={GRADE_CLASS[g].bg} style={{ width: `${bounds[i + 1] - bounds[i]}%` }} />
      ))}
    </div>
  );
}

const rangeText = (r: { min: number; max: number } | null) =>
  r ? (r.min === r.max ? fmt(r.min) : `${fmt(r.min)} – ${fmt(r.max)}`) : "—";

/** Point (and percentage) range for each grade at a given max score. */
export function RangesTable({
  max,
  cutoffs,
  step,
  highlight,
  showPercent = true,
}: {
  max: number | null;
  cutoffs: Cutoffs;
  step: 1 | 0.5;
  highlight?: Grade;
  showPercent?: boolean;
}) {
  const points = max ? pointRanges(max, cutoffs, step) : null;
  const pct = percentRanges(cutoffs);
  return (
    <table className="w-full tabular">
      <thead>
        <tr className="text-left text-xs font-medium tracking-wide text-muted uppercase">
          <th className="pb-2 font-medium">Jegy</th>
          {showPercent && <th className="pb-2 text-right font-medium">Százalék</th>}
          <th className="pb-2 text-right font-medium">Pont</th>
        </tr>
      </thead>
      <tbody>
        {[...GRADES].reverse().map((g) => (
          <tr
            key={g}
            className={`border-t border-border transition-colors ${highlight === g ? `${GRADE_CLASS[g].soft}` : ""}`}
          >
            <td className="py-2.5 pr-2">
              <span className="flex items-center gap-3">
                <GradeBadge grade={g} size="sm" />
                <span className="text-sm text-muted">{GRADE_NAMES[g]}</span>
              </span>
            </td>
            {showPercent && (
              <td className="py-2.5 text-right text-sm text-muted">
                {fmt(pct[g].from)} – {fmt(pct[g].to)}%
              </td>
            )}
            <td className={`py-2.5 pr-1 text-right font-semibold ${highlight === g ? GRADE_CLASS[g].text : ""}`}>
              {points ? rangeText(points[g]) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Which saved cutoff set is in use, with a quick switcher. */
export function PresetPicker() {
  const { settings, update, preset } = useActivePreset();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="text-muted">Sávok:</span>
      {settings.presets.length > 1 ? (
        <Select
          id="preset"
          value={preset.id}
          onChange={(id) => update((s) => ({ ...s, activeId: id }))}
          options={settings.presets.map((p) => ({
            value: p.id,
            label: p.name,
            detail: <span className="tabular">{p.cutoffs.join(" / ")}%</span>,
            extra: <CutoffBar cutoffs={p.cutoffs} />,
          }))}
        />
      ) : (
        <span id="preset" className="font-medium">
          {preset.name} <span className="font-normal text-muted tabular">({preset.cutoffs.join(" / ")}%)</span>
        </span>
      )}
      <Link href="/savok" className="no-print font-medium text-accent underline-offset-4 hover:underline">
        Szerkesztés
      </Link>
    </div>
  );
}

export function HalfPointsToggle() {
  const { settings, update } = useActivePreset();
  return (
    <label className="no-print inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
      <input
        type="checkbox"
        checked={settings.halfPoints}
        onChange={(e) => update((s) => ({ ...s, halfPoints: e.target.checked }))}
        className="h-4 w-4 accent-[var(--accent)]"
      />
      Fél pontok is
    </label>
  );
}
