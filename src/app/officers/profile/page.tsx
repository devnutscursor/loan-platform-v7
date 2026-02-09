import { createClient } from '@/lib/supabase/server';
import { getOfficerPublicLinkServer } from '@/lib/officer-public-link';
import OfficersProfileClient from './OfficersProfileClient';

export default async function OfficersProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialPublicLink: Awaited<ReturnType<typeof getOfficerPublicLinkServer>> = null;
  let initialPublicLinkFetched = false;

  if (user?.id) {
    initialPublicLink = await getOfficerPublicLinkServer(user.id);
    initialPublicLinkFetched = true;
  }

  return (
    <OfficersProfileClient
      initialPublicLink={initialPublicLink}
      initialPublicLinkFetched={initialPublicLinkFetched}
    />
  );
}
