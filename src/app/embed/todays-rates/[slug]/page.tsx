import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEmbedTodaysRates } from '@/lib/mortech/embedTodaysRates';
import { getOfficerEmbedBySlug } from '@/lib/embed/officerEmbedWidget';
import EmbedTodaysRatesTable from '@/components/embed/EmbedTodaysRatesTable';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const officer = await getOfficerEmbedBySlug(slug);
  return {
    title: officer ? `${officer.displayName} — Today's Rates` : "Today's Mortgage Rates",
    robots: 'noindex',
  };
}

export default async function EmbedTodaysRatesOfficerPage({ params }: PageProps) {
  const { slug } = await params;
  const officer = await getOfficerEmbedBySlug(slug);
  if (!officer) notFound();

  const rates = await getEmbedTodaysRates();
  const updatedAt = rates.reduce<string | null>((latest, row) => {
    if (!latest || row.updatedAt > latest) return row.updatedAt;
    return latest;
  }, null);

  return <EmbedTodaysRatesTable rates={rates} updatedAt={updatedAt} officer={officer} />;
}
