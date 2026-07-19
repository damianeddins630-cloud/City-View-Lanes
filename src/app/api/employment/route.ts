import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PersistenceError, readStore, updateStore } from "@/lib/db";
import { employmentReceivedEmail, sendEmail } from "@/lib/email";
import { makeId } from "@/lib/ids";
import type {
  EducationEntry,
  EmploymentApplication,
  WorkExperienceEntry,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function edu(raw: unknown): EducationEntry {
  const o = (raw || {}) as Record<string, unknown>;
  return {
    nameLocation: String(o.nameLocation || "").trim(),
    graduateDegree: String(o.graduateDegree || "").trim(),
    majorSubjects: String(o.majorSubjects || "").trim(),
  };
}

function job(raw: unknown): WorkExperienceEntry {
  const o = (raw || {}) as Record<string, unknown>;
  return {
    dateEmployed: String(o.dateEmployed || "").trim(),
    companyName: String(o.companyName || "").trim(),
    location: String(o.location || "").trim(),
    roleTitle: String(o.roleTitle || "").trim(),
    notes: String(o.notes || "").trim(),
  };
}

function eduComplete(e: EducationEntry) {
  return Boolean(e.nameLocation && e.graduateDegree && e.majorSubjects);
}

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
    const education = {
      highSchool: edu(body.education?.highSchool),
      college: edu(body.education?.college),
      specialized: edu(body.education?.specialized),
      other: edu(body.education?.other),
    };
    const experienceRaw = Array.isArray(body.experience) ? body.experience : [];
    const experience = [0, 1, 2, 3].map((i) => job(experienceRaw[i]));

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
      availableStartDate: String(body.availableStartDate || "").trim(),
      desiredPay: String(body.desiredPay || "").trim(),
      currentlyEmployed: String(body.currentlyEmployed || "").trim(),
      education,
      specialSkills: String(body.specialSkills || "").trim(),
      experience,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const missingRequired =
      !application.applicationDate ||
      !application.firstName ||
      !application.lastName ||
      !application.middleName ||
      !application.street ||
      !application.city ||
      !application.state ||
      !application.zip ||
      !application.altStreet ||
      !application.altCity ||
      !application.altState ||
      !application.altZip ||
      !application.homePhone ||
      !application.mobilePhone ||
      !application.email ||
      !application.howHeard ||
      !application.position ||
      !application.availableStartDate ||
      !application.desiredPay ||
      !application.currentlyEmployed ||
      !application.specialSkills ||
      !eduComplete(education.highSchool) ||
      !eduComplete(education.college) ||
      !eduComplete(education.specialized) ||
      !eduComplete(education.other);

    if (missingRequired) {
      return NextResponse.json(
        {
          error:
            "Please fill out every required field. Previous experience is optional.",
        },
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
        "Application submitted — under review on your Profile. If approved, it can take up to 7 days for us to get in contact with you.",
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
