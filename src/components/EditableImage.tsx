"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SiteImage from "@/components/SiteImage";
import { useEditMode } from "@/components/EditModeProvider";

type Props = {
  path: string;
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export default function EditableImage({
  path,
  src,
  alt,
  fill,
  priority,
  className,
  sizes,
  width,
  height,
}: Props) {
  const router = useRouter();
  const { editMode, setStatus } = useEditMode();
  const [currentSrc, setCurrentSrc] = useState(src);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setStatus("Uploading photo…");
    try {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/admin/upload", { method: "POST", body: form });
      const upData = await up.json();
      if (!up.ok) {
        setStatus(upData.error || "Upload failed");
        setBusy(false);
        return;
      }
      const url = String(upData.url || "");
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, value: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Could not save photo");
        setBusy(false);
        return;
      }
      setCurrentSrc(url);
      setStatus("Photo saved.");
      router.refresh();
    } catch {
      setStatus("Could not save photo");
    } finally {
      setBusy(false);
    }
  }

  function openPicker() {
    if (!editMode || busy) return;
    inputRef.current?.click();
  }

  return (
    <span
      data-site-edit={path}
      className={`site-editable-image ${fill ? "is-fill" : ""} ${
        editMode ? "is-editable" : ""
      }`}
      onDoubleClick={(e) => {
        if (!editMode) return;
        e.preventDefault();
        e.stopPropagation();
        openPicker();
      }}
      title={editMode ? "Double-click to change photo" : undefined}
    >
      <SiteImage
        src={currentSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        className={className}
        sizes={sizes}
        width={width}
        height={height}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          e.target.value = "";
          void onFile(file);
        }}
      />
      {editMode ? (
        <button
          type="button"
          className="site-editable-image-btn"
          disabled={busy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openPicker();
          }}
        >
          {busy ? "…" : "Change photo"}
        </button>
      ) : null}
    </span>
  );
}
