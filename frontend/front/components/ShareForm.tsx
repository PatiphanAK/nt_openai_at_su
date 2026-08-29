"use client";

import { useActionState, useRef, useState } from "react";
import { createSummaryAction, type ShareFormState } from "@/lib/actions";
import type { Course } from "@/lib/types";
import { labelDepth, labelFormat, labelTone } from "@/lib/recommend";

const FORMATS = ["outline", "bullets", "narrative", "qa", "mindmap", "flashcards"] as const;
const DEPTHS = ["quick-review", "standard", "deep-dive"] as const;
const TONES = ["concise", "friendly", "academic"] as const;

interface SectionRow {
  key: number;
  heading: string;
  body: string;
}

function PillGroup<T extends string>({
  name,
  legend,
  options,
  labels,
  defaultValue,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  labels: Record<string, string>;
  defaultValue: T;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={option === defaultValue}
              className="peer sr-only"
            />
            <span className="block rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-muted transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:font-medium peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
              {labels[option]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none";

export function ShareForm({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState<ShareFormState, FormData>(createSummaryAction, {});
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [sections, setSections] = useState<SectionRow[]>([
    { key: 0, heading: "", body: "" },
  ]);
  const nextKey = useRef(1);

  const course = courses.find((c) => c.id === courseId);

  const updateSection = (index: number, patch: Partial<SectionRow>) => {
    setSections((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Title</span>
          <input
            type="text"
            name="title"
            required
            minLength={4}
            maxLength={90}
            placeholder="e.g. Big-O Notation in Plain Language"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Course</span>
          <select
            name="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={inputCls}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold">
            Required topics covered{" "}
            <span className="font-normal text-muted">(optional)</span>
          </span>
          {course && course.requiredTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {course.requiredTopics.map((topic) => (
                <label key={topic} className="cursor-pointer">
                  <input type="checkbox" name="topics" value={topic} className="peer sr-only" />
                  <span className="block rounded-full border border-line bg-card px-3 py-1.5 text-xs text-muted transition peer-checked:border-emerald-400 peer-checked:bg-emerald-50 peer-checked:font-medium peer-checked:text-emerald-700 dark:peer-checked:bg-emerald-400/10 dark:peer-checked:text-emerald-300">
                    {topic}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">This course has no listed topics.</p>
          )}
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-line bg-card p-5">
        <p className="text-sm font-semibold text-foreground/80">
          Describe your summary style — this powers recommendations
        </p>
        <PillGroup
          name="format"
          legend="Format"
          options={FORMATS}
          labels={Object.fromEntries(FORMATS.map((f) => [f, labelFormat(f)]))}
          defaultValue="bullets"
        />
        <PillGroup
          name="depth"
          legend="Depth"
          options={DEPTHS}
          labels={Object.fromEntries(DEPTHS.map((d) => [d, labelDepth(d)]))}
          defaultValue="standard"
        />
        <PillGroup
          name="tone"
          legend="Tone"
          options={TONES}
          labels={Object.fromEntries(TONES.map((t) => [t, labelTone(t)]))}
          defaultValue="friendly"
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
          {(
            [
              ["hasExamples", "Includes worked examples"],
              ["hasFormulas", "Includes formulas"],
              ["hasDiagrams", "Includes diagrams"],
            ] as const
          ).map(([name, label]) => (
            <label key={name} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={name}
                className="h-4 w-4 rounded border-line accent-[var(--accent)]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Sections</h2>
          <p className="text-xs text-muted">
            Line tricks: <code className="rounded bg-accent-soft px-1">&quot;- &quot;</code> bullet ·{" "}
            <code className="rounded bg-accent-soft px-1">Q: / A:</code> quiz pair ·{" "}
            <code className="rounded bg-accent-soft px-1">&quot;&gt; &quot;</code> tip box
          </p>
        </div>

        {sections.map((row, index) => (
          <div key={row.key} className="rounded-2xl border border-line bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                Section {index + 1}
              </span>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSections((rows) => rows.filter((_, i) => i !== index))}
                  className="text-xs font-medium text-muted transition hover:text-rose-500"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              name={`section-heading-${index}`}
              value={row.heading}
              onChange={(e) => updateSection(index, { heading: e.target.value })}
              placeholder="Section heading (e.g. Key ideas)"
              className={`${inputCls} mb-3`}
            />
            <textarea
              name={`section-body-${index}`}
              value={row.body}
              onChange={(e) => updateSection(index, { body: e.target.value })}
              rows={6}
              placeholder={"- First key idea\n- Second key idea\n  - A detail under it\n> One exam tip"}
              className={`${inputCls} font-mono text-[13px] leading-relaxed`}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setSections((rows) => [...rows, { key: nextKey.current++, heading: "", body: "" }])
          }
          className="rounded-full border border-dashed border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
        >
          + Add section
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish summary"}
      </button>
    </form>
  );
}
