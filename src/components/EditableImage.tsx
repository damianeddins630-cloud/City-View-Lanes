"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SiteImage from "@/components/SiteImage";
import { useEditMode } from "@/components/EditModeProvider";

/** Stored value meaning “intentionally cleared” (public view uses fallback). */
export const CLEARED_IMAGE = "__cleared__";

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

function displaySrc(src: string, fallback: string) {
  if (!src || src === CLEARED_IMAGE) return fallback;
  return src;
}

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
  const cleared = currentSrc === CLEARED_IMAGE || currentSrc === "";
  const shown = displaySrc(currentSrc, deleteFallback);

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
    const data = await res.json().catch(() => ({}));
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
      const upData = await up.json().catch(() => ({}));
      if (!up.ok) {
        setStatus(upData.error || "Upload failed");
        setBusy(false);
        return;
      }
      const url = String(upData.url || "");
      if (!url) {
        setStatus("Upload failed — no URL returned");
        setBusy(false);
        return;
      }
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
    const ok = window.confirm(
      "Remove this photo? You can upload a new one anytime with Replace.",
    );
    if (!ok) return;
    setBusy(true);
    setStatus("Removing photo…");
    try {
      await patchValue(path, CLEARED_IMAGE);
      setCurrentSrc(CLEARED_IMAGE);
      setBaseline(CLEARED_IMAGE);
      setStatus("Photo removed. Use Replace to add a new one.");
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
      const mine = currentSrc || CLEARED_IMAGE;
      const theirs = siblingSrc || CLEARED_IMAGE;
      await patchValue(path, theirs);
      await patchValue(siblingPath, mine);
      setCurrentSrc(theirs);
      setBaseline(theirs);
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
      {cleared && live ? (
        <span className="site-editable-image-empty">Photo removed</span>
      ) : (
        <SiteImage
          src={shown}
          alt={alt}
          fill={fill}
          priority={priority}
          className={className}
          sizes={sizes}
          width={width}
          height={height}
        />
      )}
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
            {busy ? "…" : cleared ? "Upload" : "Replace"}
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
          {canDelete && !cleared ? (
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
