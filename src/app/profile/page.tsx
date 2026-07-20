import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import ProfileClient from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <>
      <PageBanner
        kicker="Member account"
        title="Your profile"
        subtitle="Update your photo, contact info, birth date, username, and password. Track party, league, and employment applications here."
      />
      <div className="section pt-10 pb-20">
        <ProfileClient />
      </div>
    </>
  );
}
