"use client";

import { usePathname } from "next/navigation";
import { useEditMode } from "@/components/EditModeProvider";

export default function SiteEditBar() {
  const pathname = usePathname();
  const { canEdit, editMode, toggleEditMode, status, page } = useEditMode();
  const onAdmin = pathname.startsWith("/admin");

  if (onAdmin) {
    return (
      <div className="site-edit-bar" role="region" aria-label="Admin tip">
        <p className="site-edit-status">
          Admin manages users, roles, applications, and leagues. To rename page
          text or add/remove items, open any public page and tap Edit — then use
          + / − on lists.
        </p>
      </div>
    );
  }

  if (!canEdit || !page) return null;

  return (
    <div className="site-edit-bar" role="region" aria-label="Website edit mode">
      {status ? <p className="site-edit-status">{status}</p> : null}
      <button
        type="button"
        className={`site-edit-toggle ${editMode ? "is-on" : ""}`}
        onClick={toggleEditMode}
        aria-pressed={editMode}
      >
        {editMode ? "Done editing" : "Edit"}
      </button>
    </div>
  );
}
