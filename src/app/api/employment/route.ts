import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PersistenceError, readStore, updateStore } from "@/lib/db";
import { employmentReceivedEmail, sendEmail } from "@/lib/email";
import { makeId } from "@/lib/ids";
import type { EmploymentApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const store = await readStore();
  const applications = (store.employmentApplications || []).filter(
    (a) => a.userId === user.id,
  );
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to apply for employment." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const application: EmploymentApplication = {
      id: makeId("emp"),
      userId: user.id,
      applicationDate: String(body.applicationDate || now.slice(0, 10)),
      firstName: String(body.firstName || "").trim(),
      lastName: String(body.lastName || "").trim(),
      middleName: String(body.middleName || "").trim(),
      street: String(body.street || "").trim(),
      apt: String(body.apt || "").trim(),
      city: String(body.city || "").trim(),
      state: String(body.state || "").trim(),
      zip: String(body.zip || "").trim(),
      altStreet: String(body.altStreet || "").trim(),
      altApt: String(body.altApt || "").trim(),
      altCity: String(body.altCity || "").trim(),
      altState: String(body.altState || "").trim(),
      altZip: String(body.altZip || "").trim(),
      homePhone: String(body.homePhone || "").trim(),
      mobilePhone: String(body.mobilePhone || "").trim(),
      email: String(body.email || user.email || "").trim().toLowerCase(),
      howHeard: String(body.howHeard || "").trim(),
      position: String(body.position || "").trim(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (
      !application.firstName ||
      !application.lastName ||
      !application.street ||
      !application.city ||
      !application.state ||
      !application.zip ||
      !application.mobilePhone ||
      !application.email ||
      !application.position
    ) {
      return NextResponse.json(
        { error: "Please fill in all required personal information fields." },
        { status: 400 },
      );
    }

    await updateStore((s) => {
      if (!Array.isArray(s.employmentApplications)) s.employmentApplications = [];
      s.employmentApplications.unshift(application);
    });

    const mail = employmentReceivedEmail(
      application.firstName,
      application.position,
    );
    await sendEmail({
      userId: user.id,
      email: application.email,
      subject: mail.subject,
      body: mail.body,
      kind: "employment_received",
    });

    return NextResponse.json({
      application,
      message:
        "Application submitted. It is under review — check your Profile for updates.",
    });
  } catch (error) {
    if (error instanceof PersistenceError) {
      return NextResponse.json(
        { error: error.message, durable: false },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not submit employment application." },
      { status: 500 },
    );
  }
}
