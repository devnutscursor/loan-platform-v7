import { getMortechCatalogProducts } from '@/lib/mortech/catalog';
import TodaysRatesClient from './TodaysRatesClient';

export default async function TodaysRatesPage() {
  const catalog = await getMortechCatalogProducts().catch(() => []);
  const initialProductCategoryOptions = catalog.map((p) => ({
    value: p.id,
    label: p.productName,
  }));

  return (
    <TodaysRatesClient initialProductCategoryOptions={initialProductCategoryOptions} />
  );
}
