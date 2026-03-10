import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';
import TodaysRatesClient from './TodaysRatesClient';

export default async function TodaysRatesPage() {
  // Use the 8 standard Today’s Rates buckets as Product Category options.
  const initialProductCategoryOptions = PROGRAM_BUCKETS.map((bucket) => ({
    value: bucket.id,
    label: bucket.label,
  }));

  return (
    <TodaysRatesClient initialProductCategoryOptions={initialProductCategoryOptions} />
  );
}
