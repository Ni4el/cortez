import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Certyfikacja", robots: { index: false, follow: false } };

export default function CertificationPage() {
  return <EmptyState eyebrow="Certyfikacja" title="Certyfikaty autentyczności"><p>Szczegóły certyfikacji i dokumentacji dzieł zostaną uzupełnione po zatwierdzeniu.</p></EmptyState>;
}
