import type { Metadata } from "next";
import BookClient from "@/components/BookClient";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Book a Party",
  description: "Book birthdays, corporate nights, and fundraisers at CityView Lanes.",
};

export default function BookPage() {
  return (
    <>
      <PageBanner
        kicker="Party application"
        title="Book the lanes"
        subtitle="Birthdays, corporate nights, fundraisers — we handle the lanes, the food, and the fun."
      />
      <div className="section pt-10 pb-20">
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Sign in to submit a party application. It will show on your Profile as
          under review until staff approve or deny it.
        </p>
        <BookClient />
      </div>
    </>
  );
}
