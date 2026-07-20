"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  canEditPage,
  editablePageFromPathname,
  type EditablePage,
} from "@/lib/permissions";
import type { Permission, PublicUser } from "@/lib/types";

type EditModeContextValue = {
  canEdit: boolean;
  editMode: boolean;
  page: EditablePage | null;
  setEditMode: (on: boolean) => void;
  toggleEditMode: () => void;
  status: string;
  setStatus: (msg: string) => void;
  user: PublicUser | null;
};

const EditModeContext = createContext<EditModeContextValue>({
  canEdit: false,
  editMode: false,
  page: null,
  setEditMode: () => {},
  toggleEditMode: () => {},
  status: "",
  setStatus: () => {},
  user: null,
});

const STORAGE_KEY = "cvl_edit_mode";

export function useEditMode() {
  return useContext(EditModeContext);
}

export default function EditModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = editablePageFromPathname(pathname);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [editMode, setEditModeState] = useState(false);
  const [status, setStatus] = useState("");

  const canEdit = Boolean(user && page && canEditPage(user, page));

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setUser(d.user || null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!canEdit) {
      setEditModeState(false);
      return;
    }
    try {
      setEditModeState(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setEditModeState(false);
    }
  }, [canEdit, page]);

  const setEditMode = useCallback(
    (on: boolean) => {
      if (!canEdit) {
        setEditModeState(false);
        return;
      }
      setEditModeState(on);
      try {
        sessionStorage.setItem(STORAGE_KEY, on ? "1" : "0");
      } catch {
        /* ignore */
      }
      setStatus(
        on
          ? "Edit mode on — click text to edit, use photo buttons to replace or remove."
          : "",
      );
    },
    [canEdit],
  );

  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode, setEditMode]);

  useEffect(() => {
    document.body.classList.toggle("site-edit-mode", canEdit && editMode);
    return () => document.body.classList.remove("site-edit-mode");
  }, [canEdit, editMode]);

  const value = useMemo(
    () => ({
      canEdit,
      editMode: canEdit && editMode,
      page,
      setEditMode,
      toggleEditMode,
      status,
      setStatus,
      user,
    }),
    [canEdit, editMode, page, setEditMode, toggleEditMode, status, user],
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}

/** Helper for pages that need raw permission checks in client components. */
export function permissionsOf(user: PublicUser | null): Permission[] {
  return user?.permissions || [];
}
