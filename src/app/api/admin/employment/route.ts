import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { employmentDecisionEmail, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_employment")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  const applications = (store.employmentApplications || []).map((a) => {
    const member = store.users.find((u) => u.id === a.userId);
    return {
      ...a,
      username: member?.username || "",
      memberName: member
        ? `${member.firstName} ${member.lastName}`.trim()
        : `${a.firstName} ${a.lastName}`.trim(),
    };
  });
  return NextResponse.json({ applications });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_employment")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const status = body.status === "approved" || body.status === "denied"
      ? body.status
      : null;
    const adminNote = String(body.adminNote || "").trim();
    if (!id || !status) {
      return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
    }

    let decided = null as null | {
      userId: string;
      email: string;
      firstName: string;
      position: string;
    };

    const { store } = await updateStore((s) => {
      if (!Array.isArray(s.employmentApplications)) s.employmentApplications = [];
      const app = s.employmentApplications.find((a) => a.id === id);
      if (!app) throw new Error("Application not found");
      app.status = status;
      app.adminNote = adminNote;
      app.updatedAt = new Date().toISOString();
      decided = {
        userId: app.userId,
        email: app.email,
        firstName: app.firstName,
        position: app.position,
      };
    });

    if (decided) {
      const mail = employmentDecisionEmail(
        decided.firstName,
        decided.position,
        status,
        adminNote,
      );
      await sendEmail({
        userId: decided.userId,
        email: decided.email,
        subject: mail.subject,
        body: mail.body,
        kind: status === "approved" ? "employment_approved" : "employment_denied",
      });
    }

    return NextResponse.json({
      ok: true,
      applications: store.employmentApplications,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_employment")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Application id required." }, { status: 400 });
  }

  try {
    const { store } = await updateStore((s) => {
      if (!Array.isArray(s.employmentApplications)) s.employmentApplications = [];
      const before = s.employmentApplications.length;
      s.employmentApplications = s.employmentApplications.filter((a) => a.id !== id);
      if (s.employmentApplications.length === before) {
        throw new Error("Application not found");
      }
    });
    return NextResponse.json({
      ok: true,
      applications: store.employmentApplications,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
