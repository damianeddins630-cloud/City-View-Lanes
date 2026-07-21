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
  let cur: Record<string, unknown> = content as unknown as Record<
    string,
    unknown
  >;

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

/** Default templates when appending a list item. */
export function defaultArrayItem(path: string): unknown {
  switch (path) {
    case "home.marquee":
      return "New highlight";
    case "home.whyCards":
      return { title: "New feature", copy: "Describe this feature…" };
    case "home.galleryImages":
      return {
        src: "/images/cityview-lanes.webp",
        alt: "CityView Lanes",
      };
    case "home.reviews":
      return { quote: "Great place to bowl.", name: "Guest", role: "Visitor" };
    case "youth.highlights":
      return { label: "Label", value: "Value" };
    case "youth.playerStates":
      return { code: "TX", name: "Texas", note: "Home state" };
    case "youth.playerStats":
      return { label: "Stat", value: "—" };
    case "youth.photos":
      return {
        src: "/images/yelp-lanes-kids.jpg",
        alt: "Youth bowling",
      };
    default:
      return "New item";
  }
}

function resolveArrayAtPath(
  content: SiteContent,
  path: string,
): unknown[] | null {
  const parts = path.split(".");
  let cur: unknown = content;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  return Array.isArray(cur) ? cur : null;
}

/**
 * Append or remove an item in a content array (mutates).
 * Lists cannot go empty (min length 1).
 */
export function mutateContentArray(
  content: SiteContent,
  path: string,
  op: "append" | "remove",
  index?: number,
  item?: unknown,
): void {
  const arr = resolveArrayAtPath(content, path);
  if (!arr) {
    throw new Error(`Not an editable list: ${path}`);
  }

  if (op === "append") {
    arr.push(item !== undefined ? item : defaultArrayItem(path));
    return;
  }

  if (op === "remove") {
    const i = typeof index === "number" ? index : arr.length - 1;
    if (i < 0 || i >= arr.length) {
      throw new Error("Invalid list index.");
    }
    if (arr.length <= 1) {
      throw new Error("Keep at least one item.");
    }
    arr.splice(i, 1);
  }
}
