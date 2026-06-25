import { notFound } from 'next/navigation';
import { getPublicProfileData, getPublicSelectedRatesServer } from '@/lib/public-profile';
import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';
import type { SelectedRateRow } from '@/lib/mortech/mapRatesToDisplayProducts';
import PublicProfileClient from '../public/profile/[slug]/PublicProfileClient';
import type { PublicProfileData, PublicTemplateData } from '../public/profile/[slug]/PublicProfileClient';

export default async function RootSlugPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  let initialProfileData: PublicProfileData | null = null;
  let initialTemplateData: PublicTemplateData | null = null;

  try {
    const result = await getPublicProfileData(slug);
    if (!result.success || !result.data) notFound();
    initialProfileData = result.data as PublicProfileData;
    if (initialProfileData.template) {
      initialTemplateData = {
        template: initialProfileData.template,
        pageSettings: initialProfileData.pageSettings ?? null,
        metadata: {
          templateSlug: initialProfileData.template?.slug ?? 'template1',
          isCustomized: !initialProfileData.template?.isDefault,
          isPublished: true,
        },
      };
    }
  } catch (err: any) {
    if (err?.status === 404 || err?.status === 410) notFound();
    throw err;
  }

  // Use the 8 standard Today’s Rates buckets as Product Category options on public profile as well.
  const initialProductCategoryOptions = PROGRAM_BUCKETS.map((bucket) => ({
    value: bucket.id,
    label: bucket.label,
  }));

  let initialSelectedRates: SelectedRateRow[] | undefined;
  if (initialProfileData) {
    try {
      initialSelectedRates = await getPublicSelectedRatesServer(
        initialProfileData.user.id,
        initialProfileData.company.id,
        initialProfileData.company.has_mortech_subscription !== false,
      );
    } catch {
      // Client will fetch if SSR rates fail
      initialSelectedRates = undefined;
    }
  }

  return (
    <PublicProfileClient
      initialProfileData={initialProfileData}
      initialTemplateData={initialTemplateData}
      initialSlug={slug}
      initialProductCategoryOptions={initialProductCategoryOptions}
      initialSelectedRates={initialSelectedRates}
    />
  );
}

