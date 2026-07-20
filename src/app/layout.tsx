import type { Metadata } from "next";
import { Figtree, Oswald } from "next/font/google";
import EditModeProvider from "@/components/EditModeProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageTheme from "@/components/PageTheme";
import SiteEditBar from "@/components/SiteEditBar";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Oswald({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Figtree({
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;document.body.dataset.pageTheme=p.indexOf("/pro-shop")===0?"hof":p.indexOf("/admin")===0?"admin":"site";}catch(e){}})();`,
          }}
        />
        <EditModeProvider>
          <PageTheme />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SiteEditBar />
        </EditModeProvider>
      </body>
    </html>
  );
}
