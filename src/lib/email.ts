import { updateStore } from "./db";
import type { Notification } from "./types";

function nid() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const APPROVED_CONTACT =
  "If approved, it can take up to 7 days for us to get in contact with you.";

/** Records in-app + outbound notifications (console + store) until SMTP is configured. */
export async function sendEmail(input: {
  userId: string;
  email: string;
  subject: string;
  body: string;
  kind: string;
}): Promise<Notification> {
  const notification: Notification = {
    id: nid(),
    userId: input.userId,
    email: input.email,
    subject: input.subject,
    body: input.body,
    kind: input.kind,
    createdAt: new Date().toISOString(),
    read: false,
  };

  await updateStore((store) => {
    if (!Array.isArray(store.notifications)) store.notifications = [];
    store.notifications.unshift(notification);
  }, { requireDurable: false });

  console.log("[CityView Email]", {
    to: notification.email,
    subject: notification.subject,
    body: notification.body,
  });

  return notification;
}

export function bookingReceivedEmail(name: string) {
  return {
    subject: "CityView Lanes — party application received",
    body: `Hi ${name},\n\nThanks for your party application at CityView Lanes. It is under review. Check your Profile for status updates.\n\n${APPROVED_CONTACT}\n\n— CityView Lanes\n(817) 346-0333`,
  };
}

export function bookingDecisionEmail(
  name: string,
  status: "approved" | "denied",
  note?: string,
) {
  const decision = status === "approved" ? "approved" : "denied";
  const followUp =
    status === "approved"
      ? `\n\n${APPROVED_CONTACT}`
      : "";
  return {
    subject: `CityView Lanes — party application ${decision}`,
    body: `Hi ${name},\n\nYour party application has been ${decision}.${note ? `\n\nNote from our team: ${note}` : ""}${followUp}\n\nYou can also check status on your Profile page.\n\nCall us at (817) 346-0333 with any questions.\n\n— CityView Lanes`,
  };
}

export function leagueReceivedEmail(name: string, leagueName: string) {
  return {
    subject: "CityView Lanes — league application received",
    body: `Hi ${name},\n\nWe received your league application for "${leagueName}". It is under review. Check your Profile for status updates.\n\n${APPROVED_CONTACT}\n\n— CityView Lanes\n(817) 346-0333`,
  };
}

export function leagueDecisionEmail(
  name: string,
  leagueName: string,
  status: "approved" | "denied",
  note?: string,
) {
  const decision = status === "approved" ? "approved" : "denied";
  const followUp =
    status === "approved"
      ? `\n\n${APPROVED_CONTACT}`
      : "";
  return {
    subject: `CityView Lanes — league application ${decision}`,
    body: `Hi ${name},\n\nYour application for "${leagueName}" has been ${decision}.${note ? `\n\nNote from our team: ${note}` : ""}${followUp}\n\nCheck your Profile for the latest status.\n\n— CityView Lanes\n(817) 346-0333`,
  };
}

export function employmentReceivedEmail(name: string, position: string) {
  return {
    subject: "CityView Lanes — employment application received",
    body: `Hi ${name},\n\nThank you for applying for ${position || "a position"} at CityView Lanes. Your application is under review. Check your Profile for status updates.\n\n${APPROVED_CONTACT}\n\n— CityView Lanes\n(817) 346-0333`,
  };
}

export function employmentDecisionEmail(
  name: string,
  position: string,
  status: "approved" | "denied",
  note?: string,
) {
  const decision = status === "approved" ? "approved" : "denied";
  const followUp =
    status === "approved"
      ? `\n\n${APPROVED_CONTACT}`
      : "";
  return {
    subject: `CityView Lanes — employment application ${decision}`,
    body: `Hi ${name},\n\nYour employment application for ${position || "a position"} has been ${decision}.${note ? `\n\nNote from our team: ${note}` : ""}${followUp}\n\nCheck your Profile for details.\n\n— CityView Lanes\n(817) 346-0333`,
  };
}

export { APPROVED_CONTACT };
