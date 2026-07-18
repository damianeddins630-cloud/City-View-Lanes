import { updateStore } from "./db";
import type { Notification } from "./types";

function nid() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Records outbound email notifications (console + store) until SMTP is configured. */
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
  };

  await updateStore((store) => {
    store.notifications.unshift(notification);
  });

  console.log("[CityView Email]", {
    to: notification.email,
    subject: notification.subject,
    body: notification.body,
  });

  return notification;
}

export function bookingReceivedEmail(name: string) {
  return {
    subject: "CityView Lanes — we received your booking request",
    body: `Hi ${name},\n\nThanks for booking with CityView Lanes. We will be with you shortly to confirm your party details.\n\n— CityView Lanes\n(817) 346-0333`,
  };
}

export function bookingDecisionEmail(
  name: string,
  status: "approved" | "denied",
  note?: string,
) {
  const decision = status === "approved" ? "approved" : "unable to approve";
  return {
    subject: `CityView Lanes — booking ${status}`,
    body: `Hi ${name},\n\nYour booking request has been ${decision}.${note ? `\n\nNote from our team: ${note}` : ""}\n\nCall us at (817) 346-0333 with any questions.\n\n— CityView Lanes`,
  };
}

export function leagueDecisionEmail(
  name: string,
  leagueName: string,
  status: "approved" | "denied",
  note?: string,
) {
  const decision = status === "approved" ? "approved" : "unable to approve";
  return {
    subject: `CityView Lanes — league signup ${status}`,
    body: `Hi ${name},\n\nYour signup for "${leagueName}" has been ${decision}.${note ? `\n\nNote from our team: ${note}` : ""}\n\n— CityView Lanes\n(817) 346-0333`,
  };
}
