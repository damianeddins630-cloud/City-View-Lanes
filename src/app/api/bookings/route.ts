import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PersistenceError, updateStore, readStore } from "@/lib/db";
import { bookingReceivedEmail, sendEmail } from "@/lib/email";
import { makeId } from "@/lib/ids";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const store = await readStore();
  const bookings = store.bookings.filter((b) => b.userId === user.id);
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to book a party." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || user.email).trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const eventDate = String(body.eventDate || "").trim();
    const eventTime = String(body.eventTime || "").trim();
    const partySize = Number(body.partySize || 0);
    const eventType = String(body.eventType || "Birthday").trim();
    const notes = String(body.notes || "").trim();

    if (!firstName || !lastName || !email || !phone || !eventDate || !eventTime || partySize < 1) {
      return NextResponse.json(
        { error: "Please fill in all required booking fields." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const booking = {
      id: makeId("bk"),
      userId: user.id,
      firstName,
      lastName,
      email,
      phone,
      eventDate,
      eventTime,
      partySize,
      eventType,
      notes,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    };

    await updateStore((s) => {
      s.bookings.unshift(booking);
    });

    const mail = bookingReceivedEmail(firstName);
    await sendEmail({
      userId: user.id,
      email,
      subject: mail.subject,
      body: mail.body,
      kind: "booking_received",
    });

    return NextResponse.json({
      booking,
      message:
        "Party application submitted — under review on your Profile. If approved, it can take up to 7 days for us to get in contact with you.",
    });
  } catch (error) {
    if (error instanceof PersistenceError) {
      return NextResponse.json({ error: error.message, durable: false }, { status: 503 });
    }
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }
}
