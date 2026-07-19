import type { SiteContent } from "./types";

/** Read a dotted path like home.heroSubtitle or home.whyCards.0.title */
export function getContentPath(
  content: SiteContent,
  path: string,
): string | boolean | undefined {
  if (path.startsWith("edits.")) {
    const key = path.slice("edits.".length);
    return content.edits?.[key];
  }
  const parts = path.split(".");
  let cur: unknown = content;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur === "string" || typeof cur === "boolean") return cur;
  if (typeof cur === "number") return String(cur);
  return undefined;
}

/** Write a dotted path into site content (mutates). */
export function setContentPath(
  content: SiteContent,
  path: string,
  value: string | boolean,
): void {
  if (path.startsWith("edits.")) {
    const key = path.slice("edits.".length);
    if (!content.edits) content.edits = {};
    content.edits[key] = String(value);
    return;
  }

  const parts = path.split(".");
  let cur: Record<string, unknown> = content as unknown as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const next = parts[i + 1];
    const nextIsIndex = /^\d+$/.test(next);

    if (cur[part] == null) {
      cur[part] = nextIsIndex ? [] : {};
    }

    const child = cur[part];
    if (typeof child !== "object" || child === null) {
      cur[part] = nextIsIndex ? [] : {};
    }
    cur = cur[part] as Record<string, unknown>;
  }

  const last = parts[parts.length - 1];
  if (last === "lanesAvailable") {
    cur[last] =
      value === true || value === "true" || value === "1" || value === "yes";
    return;
  }
  cur[last] = value;
}

export function resolveEditValue(
  content: SiteContent,
  path: string,
  fallback: string,
): string {
  const found = getContentPath(content, path);
  if (typeof found === "string" && found.trim()) return found;
  if (typeof found === "boolean") return found ? "true" : "false";
  return fallback;
}
