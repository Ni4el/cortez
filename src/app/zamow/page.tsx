import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Zamów", robots: { index: false, follow: false } };

export default function OrderPage() {
  return <EmptyState eyebrow="Zamówienia" title="Zapytaj o indywidualne zamówienie"><p>Warunki i możliwości zamówień zostaną opisane po ich zatwierdzeniu.</p><Link className="button" href="/kontakt">Przejdź do kontaktu</Link></EmptyState>;
}
