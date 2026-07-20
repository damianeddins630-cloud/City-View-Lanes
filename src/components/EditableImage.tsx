"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SiteImage from "@/components/SiteImage";
import { useEditMode } from "@/components/EditModeProvider";

type Props = {
  path?: string;
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  siblingPath?: string;
  siblingSrc?: string;
  canDelete?: boolean;
  deleteFallback?: string;
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
  siblingPath,
  siblingSrc,
  canDelete = true,
  deleteFallback = "/images/cityview-lanes.webp",
}: Props) {
  const router = useRouter();
  const { editMode, setStatus } = useEditMode();
  const [currentSrc, setCurrentSrc] = useState(src);
  const [baseline, setBaseline] = useState(src);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const live = Boolean(editMode && path);

  if (src !== baseline) {
    setBaseline(src);
    setCurrentSrc(src);
  }

  async function patchValue(targetPath: string, value: string) {
    const res = await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: targetPath, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save photo");
    return data;
  }

  async function onFile(file: File | null) {
    if (!file || !path) return;
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
      await patchValue(path, url);
      setCurrentSrc(url);
      setBaseline(url);
      setStatus("Photo saved.");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save photo");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    if (!path || !canDelete) return;
    if (!window.confirm("Remove this photo and restore the default image?")) return;
    setBusy(true);
    setStatus("Removing photo…");
    try {
      await patchValue(path, deleteFallback);
      setCurrentSrc(deleteFallback);
      setBaseline(deleteFallback);
      setStatus("Photo removed.");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not remove photo");
    } finally {
      setBusy(false);
    }
  }

  async function swapWithSibling() {
    if (!path || !siblingPath || siblingSrc == null) return;
    setBusy(true);
    setStatus("Reordering…");
    try {
      await patchValue(path, siblingSrc);
      await patchValue(siblingPath, currentSrc);
      setCurrentSrc(siblingSrc);
      setBaseline(siblingSrc);
      setStatus("Photos reordered.");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not reorder");
    } finally {
      setBusy(false);
    }
  }

  function openPicker() {
    if (!live || busy) return;
    inputRef.current?.click();
  }

  return (
    <span
      data-site-edit={path || undefined}
      className={`site-editable-image ${fill ? "is-fill" : ""} ${
        live ? "is-editable" : ""
      }`}
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
      {live ? (
        <span className="site-editable-image-actions">
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
            {busy ? "…" : "Replace"}
          </button>
          {siblingPath && siblingSrc != null ? (
            <button
              type="button"
              className="site-editable-image-btn"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void swapWithSibling();
              }}
            >
              Swap
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              className="site-editable-image-btn is-danger"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void removePhoto();
              }}
            >
              Remove
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
