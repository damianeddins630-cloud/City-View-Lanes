import type { Metadata } from "next";
import CareersClient from "@/components/CareersClient";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Careers | CityView Lanes",
  description: "Apply for employment at CityView Lanes in Fort Worth.",
};

export default function CareersPage() {
  return (
    <>
      <PageBanner
        kicker="Employment"
        title="Join the CityView team"
        subtitle="Submit an employment application, then track review status on your Profile. We’ll notify you when it’s approved or denied."
        kickerPath="edits.careers.bannerKicker"
        titlePath="edits.careers.bannerTitle"
        subtitlePath="edits.careers.bannerSubtitle"
      />
      <div className="section pt-10 pb-20">
        <CareersClient />
      </div>
    </>
  );
}
