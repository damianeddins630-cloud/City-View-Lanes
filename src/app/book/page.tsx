import type { Metadata } from "next";
import BookClient from "@/components/BookClient";

export const metadata: Metadata = {
  title: "Book a Party",
  description: "Book birthdays, corporate nights, and fundraisers at CityView Lanes.",
};

export default function BookPage() {
  return (
    <div className="section pt-16">
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        Book a Party
      </p>
      <h1 className="font-display mt-2 max-w-3xl text-4xl tracking-[0.04em] text-[var(--navy)] sm:text-5xl">
        Birthdays, corporate nights, fundraisers — we handle the lanes, the
        food, and the fun.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
        You must sign in (or create an account) to submit a booking request.
      </p>
      <BookClient />
    </div>
  );
}
