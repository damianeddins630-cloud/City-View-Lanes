import type { Metadata } from "next";
import ProfileClient from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="section pt-16">
      <h1 className="font-display text-5xl tracking-[0.05em] text-[var(--ink)]">
        Your profile
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Update your photo, contact info, birth date, username, and password.
      </p>
      <ProfileClient />
    </div>
  );
}
