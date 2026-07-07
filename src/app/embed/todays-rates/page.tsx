import type { Metadata } from 'next';
import { getEmbedTodaysRates } from '@/lib/mortech/embedTodaysRates';
import EmbedTodaysRatesTable from '@/components/embed/EmbedTodaysRatesTable';

export const metadata: Metadata = {
  title: "Today's Mortgage Rates",
  robots: 'noindex',
};

export default async function EmbedTodaysRatesPage() {
  const rates = await getEmbedTodaysRates();
  const updatedAt = rates.reduce<string | null>((latest, row) => {
    if (!latest || row.updatedAt > latest) return row.updatedAt;
    return latest;
  }, null);

  return <EmbedTodaysRatesTable rates={rates} updatedAt={updatedAt} />;
}
