import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";
import { ArtworkScrollRestorer } from "@/components/artwork-scroll-restorer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Portfolio Cortez",
    template: "%s | Portfolio artysty",
  },
  description: "Portfolio artysty — treści zostaną opublikowane po zatwierdzeniu.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">Przejdź do treści</a>
        <ArtworkScrollRestorer />
        <div className="site-shell">
          <SiteHeader />
          <main id="main-content">{children}</main>
          <BackToTop />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
