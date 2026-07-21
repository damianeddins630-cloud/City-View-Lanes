"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/EditModeProvider";

type Props = {
  /** Dotted path to the array, e.g. home.whyCards */
  path: string;
  /** Current item count (for disabling − when only one left) */
  count: number;
  /** Optional: remove a specific index; omit for “remove last” on the +/− bar */
  index?: number;
  /** compact = small +/− on each card; bar = section-level Add button */
  variant?: "bar" | "item";
  className?: string;
  label?: string;
};

export default function EditableListControls({
  path,
  count,
  index,
  variant = "bar",
  className = "",
  label = "item",
}: Props) {
  const router = useRouter();
  const { editMode, setStatus } = useEditMode();
  const [busy, setBusy] = useState(false);

  if (!editMode) return null;

  async function run(op: "append" | "remove", removeIndex?: number) {
    setBusy(true);
    setStatus(op === "append" ? `Adding ${label}…` : `Removing ${label}…`);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          op,
          ...(op === "remove" ? { index: removeIndex ?? index ?? count - 1 } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Could not update list");
        setBusy(false);
        return;
      }
      setStatus(op === "append" ? `Added ${label}.` : `Removed ${label}.`);
      router.refresh();
    } catch {
      setStatus("Could not update list");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "item") {
    return (
      <div className={`editable-list-item-controls ${className}`}>
        <button
          type="button"
          className="editable-list-btn is-minus"
          disabled={busy || count <= 1}
          aria-label={`Remove ${label}`}
          title="Remove"
          onClick={() => void run("remove", index)}
        >
          −
        </button>
      </div>
    );
  }

  return (
    <div className={`editable-list-bar ${className}`}>
      <button
        type="button"
        className="editable-list-btn is-plus"
        disabled={busy}
        aria-label={`Add ${label}`}
        title="Add"
        onClick={() => void run("append")}
      >
        +
      </button>
      <button
        type="button"
        className="editable-list-btn is-minus"
        disabled={busy || count <= 1}
        aria-label={`Remove last ${label}`}
        title="Remove last"
        onClick={() => void run("remove")}
      >
        −
      </button>
      <span className="editable-list-hint">
        + add / − remove {label}
        {count > 0 ? ` (${count})` : ""}
      </span>
    </div>
  );
}
