import type { Metadata } from "next";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";
import EditModeProvider from "@/components/EditModeProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteEditBar from "@/components/SiteEditBar";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | Fort Worth Bowling`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <EditModeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SiteEditBar />
        </EditModeProvider>
      </body>
    </html>
  );
}
