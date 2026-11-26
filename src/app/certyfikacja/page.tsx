import { EmptyState } from "@/components/empty-state";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";

export const generateMetadata = () => getLocalizedMetadata("certification");

export default async function CertificationPage() {
  const { messages: m } = await getRequestPreferences();
  return <EmptyState eyebrow={m.certification} title={m.certificationTitle} backButton={<LandingBackButton defaultHash="#certyfikacja" />}><p>{m.certificationText}</p></EmptyState>;
}
