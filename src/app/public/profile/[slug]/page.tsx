import { notFound } from 'next/navigation';
// Legacy route: /public/profile/[slug]
// This path is deprecated in favor of root-level /[slug] URLs.
// Always return 404 for any requests hitting this route.

export default async function PublicProfileLegacyRoute() {
  notFound();
}
