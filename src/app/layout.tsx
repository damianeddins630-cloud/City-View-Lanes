import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Cityview Lanes | Fort Worth Bowling",
    template: "%s | Cityview Lanes",
  },
  description:
    "Bowl at Cityview Lanes in Fort Worth — open bowling, leagues, birthday parties, arcade fun, and group events.",
  metadataBase: new URL("https://city-view-lanes.vercel.app"),
  openGraph: {
    title: "Cityview Lanes | Fort Worth Bowling",
    description:
      "Open bowling, leagues, parties, and arcade fun at 6601 Oakmont Blvd, Fort Worth, TX.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="site-shell min-h-full antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
