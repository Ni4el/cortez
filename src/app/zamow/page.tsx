import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";

export const generateMetadata = () => getLocalizedMetadata("order");

export default async function OrderPage() {
  const { messages: m } = await getRequestPreferences();
  return <EmptyState eyebrow={m.orders} title={m.orderTitle} backButton={<LandingBackButton defaultHash="#zamow" />}><p>{m.orderText}</p><Link className="button" href="/kontakt">{m.goToContact}</Link></EmptyState>;
}
