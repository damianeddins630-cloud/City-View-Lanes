import type { Metadata } from "next";
import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <div className="section pt-12">
      <div className="silver-bar mb-6 max-w-xs" />
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        Master control
      </p>
      <h1 className="font-display mt-2 text-5xl tracking-[0.05em] text-[var(--ink)]">
        Admin panel
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
        Your admin profile, full member records, bookings, leagues, roles, and
        hours — all in one place.
      </p>
      <AdminClient />
    </div>
  );
}
