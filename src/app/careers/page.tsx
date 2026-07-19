import CareersClient from "@/components/CareersClient";

export const metadata = {
  title: "Careers | CityView Lanes",
  description: "Apply for employment at CityView Lanes in Fort Worth.",
};

export default function CareersPage() {
  return (
    <main className="page-shell">
      <section className="mx-auto w-[min(900px,calc(100%-1.5rem))] py-10">
        <p className="text-xs font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          Employment
        </p>
        <h1 className="font-display mt-2 text-4xl text-white sm:text-5xl">
          Join the CityView team
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Submit an employment application. After you send it, you can track
          review status on your Profile. We will also send you a notification
          when it is approved or denied.
        </p>
        <CareersClient />
      </section>
    </main>
  );
}
