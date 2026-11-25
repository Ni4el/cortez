import { EmptyState } from "@/components/empty-state";
import { LandingBackButton } from "@/components/landing-back-button";

export const metadata = { title: "Kontakt", robots: { index: false, follow: false } };

export default function ContactPage() {
  return (
    <EmptyState eyebrow="Kontakt" title="Kanały kontaktu są przygotowywane" backButton={<LandingBackButton defaultHash="#kontakt" />}>
      <p>Formularz oraz zatwierdzone dane kontaktowe pojawią się po skonfigurowaniu bezpiecznej obsługi zapytań.</p>
    </EmptyState>
  );
}
