import { eq } from 'drizzle-orm';
import { db, officerEmbedWidgets, userCompanies, users } from '@/lib/db';

export type OfficerEmbedPublicProfile = {
  embedSlug: string;
  officerId: string;
  displayName: string;
  nmlsNumber: string | null;
  avatarUrl: string | null;
};

export type OfficerEmbedAdminRow = {
  officerId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileAvatar: string | null;
  profileNmls: string | null;
  embed: {
    embedSlug: string;
    displayName: string | null;
    nmlsNumber: string | null;
    avatarUrl: string | null;
    isEnabled: boolean;
    updatedAt: string;
  } | null;
};

function slugifyBase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'officer';
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function generateUniqueEmbedSlug(baseName: string): Promise<string> {
  let candidate = slugifyBase(baseName);
  for (let i = 0; i < 8; i++) {
    const slug = i === 0 ? candidate : `${candidate}-${randomSuffix()}`;
    const existing = await db
      .select({ id: officerEmbedWidgets.id })
      .from(officerEmbedWidgets)
      .where(eq(officerEmbedWidgets.embedSlug, slug))
      .limit(1);
    if (existing.length === 0) return slug;
    candidate = slugifyBase(baseName);
  }
  return `${slugifyBase(baseName)}-${Date.now().toString(36)}`;
}

export async function getOfficerEmbedBySlug(
  embedSlug: string,
): Promise<OfficerEmbedPublicProfile | null> {
  const rows = await db
    .select({
      embedSlug: officerEmbedWidgets.embedSlug,
      officerId: officerEmbedWidgets.officerId,
      displayName: officerEmbedWidgets.displayName,
      nmlsNumber: officerEmbedWidgets.nmlsNumber,
      avatarUrl: officerEmbedWidgets.avatarUrl,
      isEnabled: officerEmbedWidgets.isEnabled,
      firstName: users.firstName,
      lastName: users.lastName,
      profileNmls: users.nmlsNumber,
      profileAvatar: users.avatar,
    })
    .from(officerEmbedWidgets)
    .innerJoin(users, eq(officerEmbedWidgets.officerId, users.id))
    .where(eq(officerEmbedWidgets.embedSlug, embedSlug))
    .limit(1);

  const row = rows[0];
  if (!row || !row.isEnabled) return null;

  const fallbackName = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Loan Officer';

  return {
    embedSlug: row.embedSlug,
    officerId: row.officerId,
    displayName: (row.displayName?.trim() || fallbackName).trim(),
    nmlsNumber: row.nmlsNumber?.trim() || row.profileNmls || null,
    avatarUrl: row.avatarUrl?.trim() || row.profileAvatar || null,
  };
}

export async function listOfficerEmbedWidgetsForAdmin(): Promise<OfficerEmbedAdminRow[]> {
  const joinedRows = await db
    .select({
      officerId: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileAvatar: users.avatar,
      profileNmls: users.nmlsNumber,
    })
    .from(userCompanies)
    .innerJoin(users, eq(userCompanies.userId, users.id))
    .where(eq(userCompanies.role, 'employee'));

  const officerRows: typeof joinedRows = [];
  const seenOfficerIds = new Set<string>();
  for (const row of joinedRows) {
    if (seenOfficerIds.has(row.officerId)) continue;
    seenOfficerIds.add(row.officerId);
    officerRows.push(row);
  }

  const embedRows = await db.select().from(officerEmbedWidgets);
  const embedByOfficer = new Map(embedRows.map((r) => [r.officerId, r]));

  return officerRows
    .map((o) => {
      const embed = embedByOfficer.get(o.officerId);
      return {
        officerId: o.officerId,
        email: o.email,
        firstName: o.firstName ?? '',
        lastName: o.lastName ?? '',
        profileAvatar: o.profileAvatar,
        profileNmls: o.profileNmls,
        embed: embed
          ? {
              embedSlug: embed.embedSlug,
              displayName: embed.displayName,
              nmlsNumber: embed.nmlsNumber,
              avatarUrl: embed.avatarUrl,
              isEnabled: embed.isEnabled,
              updatedAt:
                embed.updatedAt instanceof Date
                  ? embed.updatedAt.toISOString()
                  : String(embed.updatedAt),
            }
          : null,
      };
    })
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
    );
}

export async function upsertOfficerEmbedWidget(input: {
  officerId: string;
  displayName?: string | null;
  nmlsNumber?: string | null;
  avatarUrl?: string | null;
  isEnabled?: boolean;
}): Promise<{ embedSlug: string }> {
  const officer = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.id, input.officerId))
    .limit(1);

  if (!officer[0]) {
    throw new Error('Officer not found');
  }

  const existing = await db
    .select()
    .from(officerEmbedWidgets)
    .where(eq(officerEmbedWidgets.officerId, input.officerId))
    .limit(1);

  const now = new Date();
  const displayName = input.displayName?.trim() || null;
  const nmlsNumber = input.nmlsNumber?.trim() || null;
  const avatarUrl = input.avatarUrl?.trim() || null;
  const isEnabled = input.isEnabled ?? true;

  if (existing[0]) {
    await db
      .update(officerEmbedWidgets)
      .set({
        displayName,
        nmlsNumber,
        avatarUrl,
        isEnabled,
        updatedAt: now,
      })
      .where(eq(officerEmbedWidgets.officerId, input.officerId));
    return { embedSlug: existing[0].embedSlug };
  }

  const baseName = `${officer[0].firstName ?? ''} ${officer[0].lastName ?? ''}`.trim() || 'officer';
  const embedSlug = await generateUniqueEmbedSlug(baseName);

  await db.insert(officerEmbedWidgets).values({
    officerId: input.officerId,
    embedSlug,
    displayName,
    nmlsNumber,
    avatarUrl,
    isEnabled,
    updatedAt: now,
  });

  return { embedSlug };
}

export async function getOfficerEmbedForAdmin(officerId: string) {
  const rows = await listOfficerEmbedWidgetsForAdmin();
  return rows.find((r) => r.officerId === officerId) ?? null;
}
