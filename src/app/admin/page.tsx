import type { Metadata } from "next";
import AdminClient from "@/components/AdminClient";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <div className="admin-theme">
      <PageBanner
        kicker="Master control"
        title="Admin panel"
        subtitle="Your admin profile, member records, bookings, leagues, roles, and hours — all in one place."
        image="/images/bg-admin.webp"
        imageAlt="Admin command background"
      />
      <div className="section pt-10 pb-20">
        <AdminClient />
      </div>
    </div>
  );
}
