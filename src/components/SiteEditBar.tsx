"use client";

import { useEditMode } from "@/components/EditModeProvider";

export default function SiteEditBar() {
  const { canEdit, editMode, toggleEditMode, status } = useEditMode();

  if (!canEdit) return null;

  return (
    <div className="site-edit-bar" role="region" aria-label="Website edit mode">
      {status ? <p className="site-edit-status">{status}</p> : null}
      <button
        type="button"
        className={`site-edit-toggle ${editMode ? "is-on" : ""}`}
        onClick={toggleEditMode}
      >
        {editMode ? "Done editing" : "Edit"}
      </button>
    </div>
  );
}
