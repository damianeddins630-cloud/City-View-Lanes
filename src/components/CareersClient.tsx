"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { EducationEntry, PublicUser, WorkExperienceEntry } from "@/lib/types";

const emptyEdu = (): EducationEntry => ({
  nameLocation: "",
  graduateDegree: "",
  majorSubjects: "",
});

const emptyJob = (): WorkExperienceEntry => ({
  dateEmployed: "",
  companyName: "",
  location: "",
  roleTitle: "",
  notes: "",
});

export default function CareersClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    applicationDate: today,
    firstName: "",
    lastName: "",
    middleName: "",
    street: "",
    apt: "",
    city: "",
    state: "TX",
    zip: "",
    altStreet: "",
    altApt: "",
    altCity: "",
    altState: "",
    altZip: "",
    homePhone: "",
    mobilePhone: "",
    email: "",
    howHeard: "",
    position: "",
    availableStartDate: "",
    desiredPay: "",
    currentlyEmployed: "",
    education: {
      highSchool: emptyEdu(),
      college: emptyEdu(),
      specialized: emptyEdu(),
      other: emptyEdu(),
    },
    specialSkills: "",
    experience: [emptyJob(), emptyJob(), emptyJob(), emptyJob()],
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const u = d.user as PublicUser | null;
        setUser(u);
        if (u) {
          setForm((f) => ({
            ...f,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            mobilePhone: u.phone || "",
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function setEdu(
    key: "highSchool" | "college" | "specialized" | "other",
    field: keyof EducationEntry,
    value: string,
  ) {
    setForm((f) => ({
      ...f,
      education: {
        ...f.education,
        [key]: { ...f.education[key], [field]: value },
      },
    }));
  }

  function setJob(index: number, field: keyof WorkExperienceEntry, value: string) {
    setForm((f) => {
      const experience = f.experience.map((job, i) =>
        i === index ? { ...job, [field]: value } : job,
      );
      return { ...f, experience };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/employment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Could not submit application");
      if (res.status === 401) window.location.href = "/login?next=/careers";
      return;
    }
    setMessage(
      data.message ||
        "Application submitted and under review. Check your Profile.",
    );
  }

  if (loading) {
    return <p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="panel mt-8 p-6">
        <p className="text-[var(--ink)]">
          Please sign in or create an account to submit an employment
          application.
        </p>
        <Link href="/login?next=/careers" className="btn btn-primary mt-5">
          Sign in to continue
        </Link>
      </div>
    );
  }

  const eduRows: {
    key: "highSchool" | "college" | "specialized" | "other";
    label: string;
  }[] = [
    { key: "highSchool", label: "High School" },
    { key: "college", label: "College or University" },
    { key: "specialized", label: "Specialized training, Trade School, etc." },
    { key: "other", label: "Other Education" },
  ];

  return (
    <form onSubmit={onSubmit} className="panel mt-8 grid gap-8 p-6">
      <p className="text-sm text-[var(--muted)]">
        All fields are required except Previous Experience and Apt lines. After
        you submit, track status on your{" "}
        <Link href="/profile" className="underline">
          Profile
        </Link>
        . If approved, it can take up to 7 days for us to get in contact with
        you.
      </p>

      {/* PERSONAL INFORMATION */}
      <section className="grid gap-4">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
          Personal Information
        </p>
        <div className="field max-w-xs">
          <label htmlFor="applicationDate">Date of Application *</label>
          <input
            id="applicationDate"
            type="date"
            required
            value={form.applicationDate}
            onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="firstName">First name *</label>
            <input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="middleName">Middle name *</label>
            <input
              id="middleName"
              required
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name *</label>
            <input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
          Address
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label htmlFor="street">Street *</label>
            <input
              id="street"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="apt">Apt</label>
            <input
              id="apt"
              value={form.apt}
              onChange={(e) => setForm({ ...form, apt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="zip">ZIP *</label>
            <input
              id="zip"
              required
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </div>
        </div>

        <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
          Alternate Address
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label htmlFor="altStreet">Street *</label>
            <input
              id="altStreet"
              required
              value={form.altStreet}
              onChange={(e) => setForm({ ...form, altStreet: e.target.value })}
              placeholder="Same as above or N/A"
            />
          </div>
          <div className="field">
            <label htmlFor="altApt">Apt</label>
            <input
              id="altApt"
              value={form.altApt}
              onChange={(e) => setForm({ ...form, altApt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altCity">City *</label>
            <input
              id="altCity"
              required
              value={form.altCity}
              onChange={(e) => setForm({ ...form, altCity: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altState">State *</label>
            <input
              id="altState"
              required
              value={form.altState}
              onChange={(e) => setForm({ ...form, altState: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altZip">ZIP *</label>
            <input
              id="altZip"
              required
              value={form.altZip}
              onChange={(e) => setForm({ ...form, altZip: e.target.value })}
            />
          </div>
        </div>

        <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
          Contact Information
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="homePhone">Home phone *</label>
            <input
              id="homePhone"
              required
              value={form.homePhone}
              onChange={(e) => setForm({ ...form, homePhone: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="mobilePhone">Mobile phone *</label>
            <input
              id="mobilePhone"
              required
              value={form.mobilePhone}
              onChange={(e) => setForm({ ...form, mobilePhone: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* OTHER */}
      <section className="grid gap-4">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
          Other
        </p>
        <div className="field">
          <label htmlFor="howHeard">How did you learn about our company? *</label>
          <input
            id="howHeard"
            required
            value={form.howHeard}
            onChange={(e) => setForm({ ...form, howHeard: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="position">Position applying for *</label>
          <input
            id="position"
            required
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="availableStartDate">Available start date *</label>
            <input
              id="availableStartDate"
              type="date"
              required
              value={form.availableStartDate}
              onChange={(e) =>
                setForm({ ...form, availableStartDate: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="desiredPay">Desired pay range *</label>
            <input
              id="desiredPay"
              required
              value={form.desiredPay}
              onChange={(e) => setForm({ ...form, desiredPay: e.target.value })}
              placeholder="e.g. $15–$18 / hour"
            />
          </div>
          <div className="field">
            <label htmlFor="currentlyEmployed">Are you currently employed? *</label>
            <select
              id="currentlyEmployed"
              required
              value={form.currentlyEmployed}
              onChange={(e) =>
                setForm({ ...form, currentlyEmployed: e.target.value })
              }
            >
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="grid gap-4">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
          Education
        </p>
        <p className="text-xs text-[var(--muted)]">
          Name and Location | Graduate? / Degree? | Major / Subjects of study
        </p>
        {eduRows.map((row) => (
          <div key={row.key} className="grid gap-3 bg-[rgba(232,248,255,0.35)] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">{row.label} *</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="field">
                <label>Name and location *</label>
                <input
                  required
                  value={form.education[row.key].nameLocation}
                  onChange={(e) => setEdu(row.key, "nameLocation", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Graduate? / Degree? *</label>
                <input
                  required
                  value={form.education[row.key].graduateDegree}
                  onChange={(e) =>
                    setEdu(row.key, "graduateDegree", e.target.value)
                  }
                  placeholder="Yes / No / Diploma / etc."
                />
              </div>
              <div className="field">
                <label>Major / subjects *</label>
                <input
                  required
                  value={form.education[row.key].majorSubjects}
                  onChange={(e) =>
                    setEdu(row.key, "majorSubjects", e.target.value)
                  }
                  placeholder="N/A if none"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* SKILLS */}
      <section className="grid gap-4">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
          Other
        </p>
        <div className="field">
          <label htmlFor="specialSkills">
            Areas of highest proficiency, special skills, or other items that may
            contribute to your abilities in this position *
          </label>
          <textarea
            id="specialSkills"
            required
            rows={4}
            value={form.specialSkills}
            onChange={(e) => setForm({ ...form, specialSkills: e.target.value })}
          />
        </div>
      </section>

      {/* PREVIOUS EXPERIENCE — optional */}
      <section className="grid gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            Previous Experience
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Optional — up to 4 jobs. Leave blank if none.
          </p>
        </div>
        {form.experience.map((job, index) => (
          <div key={index} className="grid gap-3 bg-[rgba(232,248,255,0.35)] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Job {index + 1}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="field">
                <label>Date employed</label>
                <input
                  value={job.dateEmployed}
                  onChange={(e) => setJob(index, "dateEmployed", e.target.value)}
                  placeholder="e.g. 2022–2024"
                />
              </div>
              <div className="field">
                <label>Company name</label>
                <input
                  value={job.companyName}
                  onChange={(e) => setJob(index, "companyName", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Location</label>
                <input
                  value={job.location}
                  onChange={(e) => setJob(index, "location", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Role / Title</label>
                <input
                  value={job.roleTitle}
                  onChange={(e) => setJob(index, "roleTitle", e.target.value)}
                />
              </div>
              <div className="field sm:col-span-2">
                <label>Job notes, tasks performed, and reason for leaving</label>
                <textarea
                  rows={3}
                  value={job.notes}
                  onChange={(e) => setJob(index, "notes", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {error ? (
        <p className="text-sm font-semibold text-red-400">{error}</p>
      ) : null}
      {message ? (
        <div className="ice-success px-4 py-3 text-sm">
          {message}{" "}
          <Link href="/profile" className="underline">
            View Profile
          </Link>
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary w-fit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
