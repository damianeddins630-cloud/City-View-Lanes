"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/EditModeProvider";

type Props = {
  path: string;
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (!editMode) setEditing(false);
  }, [editMode]);

  async function save(next: string) {
    const trimmed = next.replace(/\u00a0/g, " ").trim();
    if (trimmed === text.trim()) {
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
    if (!editMode || saving) return;
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

  return (
    <Tag
      data-site-edit={path}
      className={`site-editable-text ${editMode ? "is-editable" : ""} ${
        editing ? "is-editing" : ""
      } ${className || ""}`.trim()}
      onDoubleClick={(e: MouseEvent) => {
        if (!editMode) return;
        e.preventDefault();
        e.stopPropagation();
        startEdit();
      }}
      title={editMode ? "Double-click to edit" : undefined}
    >
      {prefix}
      <span
        ref={ref}
        contentEditable={editMode && editing}
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
