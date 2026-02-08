import { notFound } from 'next/navigation';
import { getPublicProfileData } from '@/lib/public-profile';
import PublicProfileClient from './PublicProfileClient';
import type { PublicProfileData, PublicTemplateData } from './PublicProfileClient';

export default async function PublicProfilePage({
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

  return (
    <PublicProfileClient
      initialProfileData={initialProfileData}
      initialTemplateData={initialTemplateData}
      initialSlug={slug}
    />
  );
}
