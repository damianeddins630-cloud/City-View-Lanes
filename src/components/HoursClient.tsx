"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/EditModeProvider";
import { SITE } from "@/lib/site";
import type { DayHours } from "@/lib/types";

export default function HoursClient({
  initialHours,
}: {
  initialHours: DayHours[];
}) {
  const router = useRouter();
  const { editMode, setStatus } = useEditMode();
  const [hours, setHours] = useState(initialHours);
  const [draft, setDraft] = useState(initialHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/hours?ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.hours)) {
          setHours(d.hours);
          setDraft(d.hours);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveHours(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("Saving hours…");
    try {
      const res = await fetch("/api/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Could not save hours");
        setSaving(false);
        return;
      }
      const next = Array.isArray(data.hours) ? data.hours : draft;
      setHours(next);
      setDraft(next);
      setStatus("Hours saved.");
      router.refresh();
    } catch {
      setStatus("Could not save hours");
    } finally {
      setSaving(false);
    }
  }

  function beginEditRow(index: number, field: "open" | "close", value: string) {
    const next = [...(editMode ? draft : hours)];
    next[index] = { ...next[index], [field]: value };
    setDraft(next);
  }

  if (editMode) {
    const rows = draft.length ? draft : hours;
    return (
      <form onSubmit={saveHours} className="panel mt-10 space-y-3 p-5">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
          Edit hours
        </p>
        {rows.map((row, index) => (
          <div
            key={row.day}
            className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_1fr] sm:items-end"
          >
            <p className="font-display text-xl text-[var(--ink)]">{row.day}</p>
            <div className="field">
              <label htmlFor={`open-${row.day}`}>Open</label>
              <input
                id={`open-${row.day}`}
                value={row.open}
                onChange={(e) => beginEditRow(index, "open", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`close-${row.day}`}>Close</label>
              <input
                id={`close-${row.day}`}
                value={row.close}
                onChange={(e) => beginEditRow(index, "close", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save hours"}
        </button>
      </form>
    );
  }

  return (
    <>
      <div className="panel mt-10 overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-[var(--muted)]">Loading hours…</p>
        ) : (
          hours.map((row) => (
            <div
              key={row.day}
              className="interactive-row grid gap-2 px-5 py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-8"
            >
              <p className="font-display text-2xl tracking-[0.04em] text-[var(--ink)]">
                {row.day}
              </p>
              <p className="text-xs font-bold tracking-[0.14em] text-[var(--silver-deep)] uppercase">
                Hours
              </p>
              <p className="text-lg font-semibold text-[var(--ink)]">{row.open}</p>
              <p className="text-lg text-[var(--muted)]">
                <span className="mr-2 text-sm uppercase">to</span>
                {row.close}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="panel mt-10 bg-[var(--blue-soft)] p-6">
        <h2 className="font-display text-2xl text-[var(--ink)]">
          Holiday or special hours?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Call ahead on major holidays to confirm hours and lane availability.
        </p>
        <a href={`tel:${SITE.phoneTel}`} className="btn btn-primary mt-5 inline-flex">
          {SITE.phoneDisplay}
        </a>
      </div>
    </>
  );
}
