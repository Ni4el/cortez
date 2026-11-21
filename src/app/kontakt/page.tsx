import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Kontakt", robots: { index: false, follow: false } };

export default function ContactPage() {
  return (
    <EmptyState eyebrow="Kontakt" title="Kanały kontaktu są przygotowywane">
      <p>Formularz oraz zatwierdzone dane kontaktowe pojawią się po skonfigurowaniu bezpiecznej obsługi zapytań.</p>
    </EmptyState>
  );
}
