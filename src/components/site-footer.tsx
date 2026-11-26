import { getRequestPreferences } from "@/lib/i18n.server";

export async function SiteFooter() {
  const { messages } = await getRequestPreferences();
  return (
    <footer className="site-footer">
      <p>{messages.footer}</p>
    </footer>
  );
}
