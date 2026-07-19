import type { Metadata } from "next";
import LoginClient from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <LoginClient nextPath={params.next || "/profile"} />;
}
