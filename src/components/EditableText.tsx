"use client";

import {
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/EditModeProvider";

type Props = {
  path?: string;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  prefix?: string;
  suffix?: string;
};

export default function EditableText({
  path,
  value,
  as: Tag = "span",
  className,
  multiline = false,
  prefix = "",
  suffix = "",
}: Props) {
  const router = useRouter();
  const { editMode, setStatus } = useEditMode();
  const [text, setText] = useState(value);
  const [baseline, setBaseline] = useState(value);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const live = Boolean(editMode && path);

  if (!editing && value !== baseline) {
    setBaseline(value);
    setText(value);
  }
  if (!live && editing) {
    setEditing(false);
  }

  async function save(next: string) {
    if (!path) return;
    const trimmed = next.replace(/\u00a0/g, " ").trim();
    if (trimmed === text.trim()) {
      setEditing(false);
      return;
    }
    if (!trimmed) {
      setStatus("Text cannot be empty.");
      if (ref.current) ref.current.textContent = text;
      setEditing(false);
      return;
    }
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, value: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Could not save");
        setSaving(false);
        return;
      }
      setText(trimmed);
      setBaseline(trimmed);
      setEditing(false);
      setStatus("Saved.");
      router.refresh();
    } catch {
      setStatus("Could not save");
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    if (!live || saving) return;
    setEditing(true);
    queueMicrotask(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (ref.current) ref.current.textContent = text;
      setEditing(false);
      return;
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      const next = ref.current?.innerText ?? text;
      void save(next);
    }
  }

  function onBlur() {
    if (!editing) return;
    const next = ref.current?.innerText ?? text;
    void save(next);
  }

  function onActivate(e: MouseEvent) {
    if (!live) return;
    e.preventDefault();
    e.stopPropagation();
    startEdit();
  }

  return (
    <Tag
      data-site-edit={path || undefined}
      className={`site-editable-text ${live ? "is-editable" : ""} ${
        editing ? "is-editing" : ""
      } ${className || ""}`.trim()}
      onClick={onActivate}
      onDoubleClick={onActivate}
      title={live ? "Click to edit" : undefined}
    >
      {prefix}
      <span
        ref={ref}
        contentEditable={live && editing}
        suppressContentEditableWarning
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      >
        {text}
      </span>
      {suffix}
    </Tag>
  );
}
