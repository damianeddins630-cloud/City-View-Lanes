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

type EditModeContextValue = {
  canEdit: boolean;
  editMode: boolean;
  setEditMode: (on: boolean) => void;
  toggleEditMode: () => void;
  status: string;
  setStatus: (msg: string) => void;
};

const EditModeContext = createContext<EditModeContextValue>({
  canEdit: false,
  editMode: false,
  setEditMode: () => {},
  toggleEditMode: () => {},
  status: "",
  setStatus: () => {},
});

const STORAGE_KEY = "cvl_edit_mode";

export function useEditMode() {
  return useContext(EditModeContext);
}

export default function EditModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [canEdit, setCanEdit] = useState(false);
  const [editMode, setEditModeState] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const perms: string[] = d.user?.permissions || [];
        const allowed =
          perms.includes("edit_site") || perms.includes("manage_content");
        setCanEdit(allowed);
        if (!allowed) {
          setEditModeState(false);
          return;
        }
        try {
          setEditModeState(sessionStorage.getItem(STORAGE_KEY) === "1");
        } catch {
          setEditModeState(false);
        }
      })
      .catch(() => {
        if (active) setCanEdit(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const setEditMode = useCallback((on: boolean) => {
    setEditModeState(on);
    try {
      sessionStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
    setStatus(on ? "Edit mode on — double-click text or photos to change them." : "");
  }, []);

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
      setEditMode,
      toggleEditMode,
      status,
      setStatus,
    }),
    [canEdit, editMode, setEditMode, toggleEditMode, status],
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}
