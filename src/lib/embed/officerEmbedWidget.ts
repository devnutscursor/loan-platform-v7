import { and, eq } from 'drizzle-orm';
import { db, officerEmbedWidgets, userCompanies, users } from '@/lib/db';
import { DEFAULT_EMBED_ACCENT_COLOR } from '@/lib/embed/constants';

export type OfficerEmbedPublicProfile = {
  embedSlug: string;
  officerId: string | null;
  displayName: string;
  nmlsNumber: string | null;
  avatarUrl: string | null;
  accentColor: string;
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
    accentColor: string | null;
    isEnabled: boolean;
    updatedAt: string;
  } | null;
};

export type ExternalEmbedAdminRow = {
  widgetId: string;
  contactEmail: string | null;
  displayName: string;
  nmlsNumber: string | null;
  avatarUrl: string | null;
  accentColor: string | null;
  embedSlug: string;
  isEnabled: boolean;
  updatedAt: string;
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

function normalizeAccentColor(color?: string | null): string {
  const trimmed = color?.trim();
  if (trimmed && /^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  return DEFAULT_EMBED_ACCENT_COLOR;
}

function mapEmbedFields(embed: typeof officerEmbedWidgets.$inferSelect) {
  return {
    embedSlug: embed.embedSlug,
    displayName: embed.displayName,
    nmlsNumber: embed.nmlsNumber,
    avatarUrl: embed.avatarUrl,
    accentColor: embed.accentColor,
    isEnabled: embed.isEnabled,
    updatedAt:
      embed.updatedAt instanceof Date ? embed.updatedAt.toISOString() : String(embed.updatedAt),
  };
}

export async function generateUniqueEmbedSlug(
  baseName: string,
  excludeWidgetId?: string,
): Promise<string> {
  let candidate = slugifyBase(baseName);
  for (let i = 0; i < 8; i++) {
    const slug = i === 0 ? candidate : `${candidate}-${randomSuffix()}`;
    const existing = await db
      .select({ id: officerEmbedWidgets.id })
      .from(officerEmbedWidgets)
      .where(eq(officerEmbedWidgets.embedSlug, slug))
      .limit(1);
    if (existing.length === 0) return slug;
    if (excludeWidgetId && existing[0].id === excludeWidgetId) return slug;
    candidate = slugifyBase(baseName);
  }
  return `${slugifyBase(baseName)}-${Date.now().toString(36)}`;
}

/** Prefer clean slug from display name; keep current if unchanged / still owned. */
async function resolveUpdatedEmbedSlug(
  displayName: string,
  widgetId: string,
  currentSlug: string,
): Promise<string> {
  const desired = slugifyBase(displayName);
  if (!desired) return currentSlug;
  if (desired === currentSlug) return currentSlug;
  return generateUniqueEmbedSlug(displayName, widgetId);
}

export async function getOfficerEmbedBySlug(
  embedSlug: string,
): Promise<OfficerEmbedPublicProfile | null> {
  const rows = await db
    .select({
      embedSlug: officerEmbedWidgets.embedSlug,
      officerId: officerEmbedWidgets.officerId,
      isExternal: officerEmbedWidgets.isExternal,
      displayName: officerEmbedWidgets.displayName,
      nmlsNumber: officerEmbedWidgets.nmlsNumber,
      avatarUrl: officerEmbedWidgets.avatarUrl,
      accentColor: officerEmbedWidgets.accentColor,
      isEnabled: officerEmbedWidgets.isEnabled,
      firstName: users.firstName,
      lastName: users.lastName,
      profileNmls: users.nmlsNumber,
      profileAvatar: users.avatar,
    })
    .from(officerEmbedWidgets)
    .leftJoin(users, eq(officerEmbedWidgets.officerId, users.id))
    .where(eq(officerEmbedWidgets.embedSlug, embedSlug))
    .limit(1);

  const row = rows[0];
  if (!row || !row.isEnabled) return null;

  const fallbackName = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Loan Officer';
  const displayName = (row.displayName?.trim() || fallbackName).trim();
  if (!displayName) return null;

  return {
    embedSlug: row.embedSlug,
    officerId: row.officerId,
    displayName,
    nmlsNumber: row.nmlsNumber?.trim() || row.profileNmls || null,
    avatarUrl: row.avatarUrl?.trim() || row.profileAvatar || null,
    accentColor: normalizeAccentColor(row.accentColor),
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

  const embedRows = await db
    .select()
    .from(officerEmbedWidgets)
    .where(eq(officerEmbedWidgets.isExternal, false));

  const embedByOfficer = new Map(
    embedRows.filter((r) => r.officerId).map((r) => [r.officerId!, r]),
  );

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
        embed: embed ? mapEmbedFields(embed) : null,
      };
    })
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
    );
}

export async function listExternalEmbedWidgetsForAdmin(): Promise<ExternalEmbedAdminRow[]> {
  const rows = await db
    .select()
    .from(officerEmbedWidgets)
    .where(eq(officerEmbedWidgets.isExternal, true))
    .orderBy(officerEmbedWidgets.updatedAt);

  return rows
    .map((row) => ({
      widgetId: row.id,
      contactEmail: row.contactEmail,
      displayName: row.displayName?.trim() || 'Loan Officer',
      nmlsNumber: row.nmlsNumber,
      avatarUrl: row.avatarUrl,
      accentColor: row.accentColor,
      embedSlug: row.embedSlug,
      isEnabled: row.isEnabled,
      updatedAt:
        row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function upsertOfficerEmbedWidget(input: {
  officerId: string;
  displayName?: string | null;
  nmlsNumber?: string | null;
  avatarUrl?: string | null;
  accentColor?: string | null;
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
    .where(
      and(
        eq(officerEmbedWidgets.officerId, input.officerId),
        eq(officerEmbedWidgets.isExternal, false),
      ),
    )
    .limit(1);

  const now = new Date();
  const displayName = input.displayName?.trim() || null;
  const nmlsNumber = input.nmlsNumber?.trim() || null;
  const avatarUrl = input.avatarUrl?.trim() || null;
  const accentColor = normalizeAccentColor(input.accentColor);
  const isEnabled = input.isEnabled ?? true;

  if (existing[0]) {
    const nameForSlug =
      displayName ||
      `${officer[0].firstName ?? ''} ${officer[0].lastName ?? ''}`.trim() ||
      'officer';
    const embedSlug = await resolveUpdatedEmbedSlug(
      nameForSlug,
      existing[0].id,
      existing[0].embedSlug,
    );
    await db
      .update(officerEmbedWidgets)
      .set({
        displayName,
        nmlsNumber,
        avatarUrl,
        accentColor,
        embedSlug,
        isEnabled,
        updatedAt: now,
      })
      .where(eq(officerEmbedWidgets.id, existing[0].id));
    return { embedSlug };
  }

  const baseName = `${officer[0].firstName ?? ''} ${officer[0].lastName ?? ''}`.trim() || 'officer';
  const embedSlug = await generateUniqueEmbedSlug(baseName);

  await db.insert(officerEmbedWidgets).values({
    officerId: input.officerId,
    isExternal: false,
    embedSlug,
    displayName,
    nmlsNumber,
    avatarUrl,
    accentColor,
    isEnabled,
    updatedAt: now,
  });

  return { embedSlug };
}

export async function createExternalEmbedWidget(input: {
  displayName: string;
  nmlsNumber?: string | null;
  avatarUrl?: string | null;
  accentColor?: string | null;
  contactEmail?: string | null;
  isEnabled?: boolean;
}): Promise<{ widgetId: string; embedSlug: string }> {
  const displayName = input.displayName?.trim();
  if (!displayName) {
    throw new Error('Display name is required');
  }

  const now = new Date();
  const embedSlug = await generateUniqueEmbedSlug(displayName);

  const [row] = await db
    .insert(officerEmbedWidgets)
    .values({
      officerId: null,
      isExternal: true,
      contactEmail: input.contactEmail?.trim() || null,
      embedSlug,
      displayName,
      nmlsNumber: input.nmlsNumber?.trim() || null,
      avatarUrl: input.avatarUrl?.trim() || null,
      accentColor: normalizeAccentColor(input.accentColor),
      isEnabled: input.isEnabled ?? true,
      updatedAt: now,
    })
    .returning({ id: officerEmbedWidgets.id, embedSlug: officerEmbedWidgets.embedSlug });

  return { widgetId: row.id, embedSlug: row.embedSlug };
}

export async function updateExternalEmbedWidget(
  widgetId: string,
  input: {
    displayName?: string | null;
    nmlsNumber?: string | null;
    avatarUrl?: string | null;
    accentColor?: string | null;
    contactEmail?: string | null;
    isEnabled?: boolean;
  },
): Promise<{ embedSlug: string }> {
  const existing = await db
    .select()
    .from(officerEmbedWidgets)
    .where(and(eq(officerEmbedWidgets.id, widgetId), eq(officerEmbedWidgets.isExternal, true)))
    .limit(1);

  if (!existing[0]) {
    throw new Error('External embed widget not found');
  }

  const displayName = input.displayName?.trim() || existing[0].displayName;
  if (!displayName?.trim()) {
    throw new Error('Display name is required');
  }

  const embedSlug = await resolveUpdatedEmbedSlug(
    displayName.trim(),
    widgetId,
    existing[0].embedSlug,
  );

  const now = new Date();
  await db
    .update(officerEmbedWidgets)
    .set({
      displayName: displayName.trim(),
      embedSlug,
      nmlsNumber: input.nmlsNumber !== undefined ? input.nmlsNumber?.trim() || null : existing[0].nmlsNumber,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl?.trim() || null : existing[0].avatarUrl,
      accentColor:
        input.accentColor !== undefined
          ? normalizeAccentColor(input.accentColor)
          : existing[0].accentColor,
      contactEmail:
        input.contactEmail !== undefined
          ? input.contactEmail?.trim() || null
          : existing[0].contactEmail,
      isEnabled: input.isEnabled ?? existing[0].isEnabled,
      updatedAt: now,
    })
    .where(eq(officerEmbedWidgets.id, widgetId));

  return { embedSlug };
}

export async function getOfficerEmbedForAdmin(officerId: string) {
  const rows = await listOfficerEmbedWidgetsForAdmin();
  return rows.find((r) => r.officerId === officerId) ?? null;
}

export async function getExternalEmbedForAdmin(widgetId: string) {
  const rows = await listExternalEmbedWidgetsForAdmin();
  return rows.find((r) => r.widgetId === widgetId) ?? null;
}
