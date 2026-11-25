import { EmptyState } from "@/components/empty-state";
import { LandingBackButton } from "@/components/landing-back-button";

export const metadata = { title: "Certyfikacja", robots: { index: false, follow: false } };

export default function CertificationPage() {
  return <EmptyState eyebrow="Certyfikacja" title="Certyfikaty autentyczności" backButton={<LandingBackButton defaultHash="#certyfikacja" />}><p>Szczegóły certyfikacji i dokumentacji dzieł zostaną uzupełnione po zatwierdzeniu.</p></EmptyState>;
}
