import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";
import { ArtworkScrollRestorer } from "@/components/artwork-scroll-restorer";
import { LocaleProvider } from "@/components/locale-provider";
import { getRequestPreferences } from "@/lib/i18n.server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getRequestPreferences();
  return {
    title: { default: "Portfolio Cortez", template: "%s | Portfolio Cortez" },
    description: messages.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const preferences = await getRequestPreferences();
  return (
    <html lang={preferences.language.code} suppressHydrationWarning>
      <body>
        <LocaleProvider {...preferences}>
        <a className="skip-link" href="#main-content">{preferences.messages.skip}</a>
        <ArtworkScrollRestorer />
        <div className="site-shell">
          <SiteHeader />
          <main id="main-content">{children}</main>
          <BackToTop />
          <SiteFooter />
        </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
