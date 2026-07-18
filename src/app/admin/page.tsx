import type { Metadata } from "next";
import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <div className="section pt-12">
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        Master control
      </p>
      <h1 className="font-display mt-2 text-5xl tracking-[0.05em] text-[var(--navy)]">
        Admin panel
      </h1>
      <AdminClient />
    </div>
  );
}
