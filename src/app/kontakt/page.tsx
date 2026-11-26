import { EmptyState } from "@/components/empty-state";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";

export const generateMetadata = () => getLocalizedMetadata("contact");

export default async function ContactPage() {
  const { messages: m } = await getRequestPreferences();
  return (
    <EmptyState eyebrow={m.contact} title={m.contactTitle} backButton={<LandingBackButton defaultHash="#kontakt" />}>
      <p>{m.contactText}</p>
    </EmptyState>
  );
}
