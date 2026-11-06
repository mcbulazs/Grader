"use client";

import { useEffect, useState } from "react";
import { CutoffBar, GRADE_CLASS, HalfPointsToggle } from "@/components/grade-ui";
import { fmt, GRADE_NAMES, GRADES, percentRanges, validateCutoffs, type Cutoffs, type Grade } from "@/lib/grading";
import { DEFAULT_PRESET, decodePreset, encodePreset, newId, useSettings, type Preset } from "@/lib/store";

export default function Presets() {
  const [settings, update] = useSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<Omit<Preset, "id"> | "invalid" | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // A colleague's share link: /savok?sav=...
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("sav");
    if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once on load
      setIncoming(decodePreset(raw) ?? "invalid");
      window.history.replaceState(null, "", "/savok");
    }
  }, []);

  const save = (p: Preset) => update((s) => ({ ...s, presets: s.presets.map((x) => (x.id === p.id ? p : x)) }));

  const add = (base: Omit<Preset, "id">, edit = true) => {
    const p = { ...base, id: newId() };
    update((s) => ({ ...s, presets: [...s.presets, p], activeId: p.id }));
    if (edit) setEditingId(p.id);
  };

  const remove = (p: Preset) => {
    if (!confirm(`Törlöd a(z) „${p.name}” sávot?`)) return;
    update((s) => {
      const presets = s.presets.filter((x) => x.id !== p.id);
      return { ...s, presets, activeId: s.activeId === p.id ? presets[0].id : s.activeId };
    });
  };

  const share = async (p: Preset) => {
    const url = `${window.location.origin}/savok?sav=${encodePreset(p)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt("Másold ki ezt a linket:", url);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sávok</h1>
          <p className="mt-1 max-w-xl text-muted">
            Itt adhatod meg, hány százaléktól jár az egyes jegy. Több sávot is elmenthetsz (pl. tantárgyanként), és linkkel
            megoszthatod a kollégáiddal.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => add({ name: "Új sáv", cutoffs: [...DEFAULT_PRESET.cutoffs] as Cutoffs })}>
          + Új sáv
        </button>
      </div>

      {incoming !== null && incoming !== "invalid" && (
        <div className="card flex flex-wrap items-center justify-between gap-4 border-accent/50 bg-accent/5">
          <div>
            <div className="font-semibold">Megosztott sáv: {incoming.name}</div>
            <div className="text-sm text-muted tabular">{incoming.cutoffs.join(" / ")}%</div>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setIncoming(null)}>
              Mégse
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                add(incoming, false);
                setIncoming(null);
              }}
            >
              Mentés és használat
            </button>
          </div>
        </div>
      )}
      {incoming === "invalid" && (
        <div role="alert" className="card flex items-center justify-between gap-4 border-danger/50 text-sm">
          A megosztott link hibás vagy hiányos, ezért nem lehet betölteni.
          <button className="btn" onClick={() => setIncoming(null)}>
            Bezárás
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {settings.presets.map((p) =>
          editingId === p.id ? (
            <PresetEditor
              key={p.id}
              preset={p}
              onSave={(next) => {
                save(next);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <article
              key={p.id}
              className={`card flex flex-col gap-4 ${settings.activeId === p.id ? "border-accent ring-4 ring-accent/15" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted tabular">{p.cutoffs.join(" / ")}%</p>
                </div>
                {settings.activeId === p.id ? (
                  <span className="shrink-0 rounded-full bg-accent/12 px-2.5 py-1 text-xs font-semibold text-accent">Használatban</span>
                ) : (
                  <button className="btn shrink-0" onClick={() => update((s) => ({ ...s, activeId: p.id }))}>
                    Használat
                  </button>
                )}
              </div>
              <CutoffBar cutoffs={p.cutoffs} />
              <PercentList cutoffs={p.cutoffs} />
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <button className="btn" onClick={() => setEditingId(p.id)}>
                  Szerkesztés
                </button>
                <button className="btn" onClick={() => add({ name: `${p.name} (másolat)`, cutoffs: [...p.cutoffs] as Cutoffs })}>
                  Másolat
                </button>
                <button className="btn" onClick={() => share(p)}>
                  {copiedId === p.id ? "Link kimásolva ✓" : "Megosztás"}
                </button>
                {settings.presets.length > 1 && (
                  <button className="btn btn-danger ml-auto" onClick={() => remove(p)}>
                    Törlés
                  </button>
                )}
              </div>
            </article>
          ),
        )}
      </div>

      <section className="card flex flex-col gap-3">
        <h2 className="font-semibold">Beállítások</h2>
        <HalfPointsToggle />
        <p className="text-sm text-muted">
          Bekapcsolva a ponthatár-táblázatok fél pontokkal számolnak (pl. 17,5 pont). Pontszámot fél ponttal mindig beírhatsz.
        </p>
      </section>

      <section className="card text-sm text-muted">
        <h2 className="mb-2 font-semibold text-text">Hogyan számol?</h2>
        <p>
          Az elért pontot elosztja az összponttal, és a százalékot egy tizedesre kerekíti. A határ az adott jegy legmagasabb
          százaléka: 34-es határnál a 34,0% még 1-es, a 34,1% már 2-es. A 100% mindig 5-ös.
        </p>
      </section>
    </div>
  );
}

function PercentList({ cutoffs }: { cutoffs: Cutoffs }) {
  const r = percentRanges(cutoffs);
  return (
    <ul className="grid grid-cols-5 gap-2 text-center text-xs tabular">
      {GRADES.map((g) => (
        <li key={g} className={`rounded-lg px-1 py-2 ${GRADE_CLASS[g].soft}`}>
          <div className={`text-base font-semibold ${GRADE_CLASS[g].text}`}>{g}</div>
          <div className="text-muted">
            {fmt(r[g].from)}–{fmt(r[g].to)}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PresetEditor({ preset, onSave, onCancel }: { preset: Preset; onSave: (p: Preset) => void; onCancel: () => void }) {
  const [name, setName] = useState(preset.name);
  const [values, setValues] = useState(preset.cutoffs.map(String));
  const nums = values.map((v) => (v.trim() === "" ? NaN : Number(v.replace(",", "."))));
  const error = !name.trim() ? "Adj nevet a sávnak." : validateCutoffs(nums);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) onSave({ ...preset, name: name.trim().slice(0, 60), cutoffs: nums as Cutoffs });
  };

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 border-accent ring-4 ring-accent/15">
      <div>
        <label htmlFor={`name-${preset.id}`} className="label">
          Név
        </label>
        <input
          id={`name-${preset.id}`}
          className="field"
          autoFocus
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div>
      <fieldset>
        <legend className="label">Legfeljebb ennyi százalékig jár:</legend>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as Grade[]).map((g, i) => (
            <div key={g}>
              <label htmlFor={`c${g}-${preset.id}`} className={`mb-1 block text-center text-sm font-semibold ${GRADE_CLASS[g].text}`}>
                {g} <span className="font-normal text-muted">({GRADE_NAMES[g]})</span>
              </label>
              <input
                id={`c${g}-${preset.id}`}
                className="field px-2 text-center tabular"
                inputMode="decimal"
                value={values[i]}
                onChange={(e) => setValues((vs) => vs.map((v, j) => (j === i ? e.target.value : v)))}
                onFocus={(e) => e.target.select()}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Az 5-ös a 4-es határa felett jár, egészen 100%-ig.</p>
      </fieldset>
      {!error && <CutoffBar cutoffs={nums as Cutoffs} />}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={!!error}>
          Mentés
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Mégse
        </button>
      </div>
    </form>
  );
}
