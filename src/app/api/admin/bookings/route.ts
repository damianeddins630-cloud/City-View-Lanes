import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { bookingDecisionEmail, sendEmail } from "@/lib/email";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_bookings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  const bookings = store.bookings.map((b) => {
    const member = store.users.find((u) => u.id === b.userId);
    return {
      ...b,
      username: member?.username || "",
      memberName: member
        ? `${member.firstName} ${member.lastName}`.trim()
        : "",
    };
  });
  return NextResponse.json({ bookings });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_bookings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const status = body.status as "approved" | "denied";
    const adminNote = String(body.adminNote || "").trim();

    if (!id || !["approved", "denied"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    let bookingEmail = "";
    let bookingName = "";
    let bookingUserId = "";

    await updateStore((s) => {
      const booking = s.bookings.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      booking.status = status;
      booking.adminNote = adminNote;
      booking.updatedAt = new Date().toISOString();
      bookingEmail = booking.email;
      bookingName = booking.firstName;
      bookingUserId = booking.userId;
    });

    const mail = bookingDecisionEmail(bookingName, status, adminNote);
    await sendEmail({
      userId: bookingUserId,
      email: bookingEmail,
      subject: mail.subject,
      body: mail.body,
      kind: `booking_${status}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_bookings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Application id required." }, { status: 400 });
  }

  try {
    await updateStore((s) => {
      const before = s.bookings.length;
      s.bookings = s.bookings.filter((b) => b.id !== id);
      if (s.bookings.length === before) throw new Error("Application not found");
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
