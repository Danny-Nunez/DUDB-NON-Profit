import crypto from 'crypto';
import { getPageContent, upsertPageContent } from './adminPages.js';
import { pageDefaults } from './pageDefaults.js';

type DefaultAboutContent = typeof pageDefaults.about;

type StoredBoardMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  createdAt?: string;
};

type LanguageContent<T> = Omit<T, 'boardMembers'> & { boardMembers: StoredBoardMember[] };

type AboutContent = {
  en: LanguageContent<DefaultAboutContent['en']>;
  es: LanguageContent<DefaultAboutContent['es']>;
};

interface BoardMemberLocaleFields {
  name: string;
  role: string;
  description: string;
}

interface BoardMemberLocaleEntry extends BoardMemberLocaleFields {
  id: string;
  imageUrl: string;
  imageKey?: string;
  createdAt: string;
}

export interface BoardMemberRecord {
  id: string;
  imageUrl: string;
  imageKey?: string;
  createdAt: string;
  en: BoardMemberLocaleFields;
  es: BoardMemberLocaleFields;
}

export interface BoardMemberPayload {
  imageUrl?: string;
  imageKey?: string;
  en: BoardMemberLocaleFields;
  es: BoardMemberLocaleFields;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mergeAboutContent(existing: Record<string, unknown> | undefined): AboutContent {
  const base = deepClone(pageDefaults.about) as unknown as AboutContent;
  if (!existing || typeof existing !== 'object') {
    return base;
  }

  const candidate = existing as Record<string, unknown>;

  const assignLanguage = (language: 'en' | 'es') => {
    const source = candidate[language];
    if (!source || typeof source !== 'object') return;
    const langSource = source as Record<string, unknown>;
    const boardMembers = Array.isArray(langSource.boardMembers)
      ? (langSource.boardMembers as unknown[]).map((member) => deepClone(member) as StoredBoardMember)
      : undefined;
    const clone = deepClone(langSource) as Record<string, unknown>;
    delete clone.boardMembers;
    Object.assign(base[language], clone);
    if (boardMembers) {
      base[language].boardMembers = boardMembers;
    }
  };

  assignLanguage('en');
  assignLanguage('es');

  return base;
}

function toContentRecord(content: AboutContent): Record<string, unknown> {
  return deepClone(content) as Record<string, unknown>;
}

function normalizeBoardMembers(content: AboutContent): {
  records: BoardMemberRecord[];
  content: AboutContent;
  changed: boolean;
} {
  const enArrayRaw = Array.isArray(content.en.boardMembers) ? content.en.boardMembers : [];
  const esArrayRaw = Array.isArray(content.es.boardMembers) ? content.es.boardMembers : [];

  let changed = false;

  const sanitizeLocale = (entries: unknown[]): BoardMemberLocaleEntry[] => {
    return entries.map((entry) => {
      const candidate = (entry ?? {}) as Record<string, unknown>;
      const id = typeof candidate.id === 'string' && candidate.id.trim() ? candidate.id.trim() : crypto.randomUUID();
      const createdAt =
        typeof candidate.createdAt === 'string' && candidate.createdAt.trim()
          ? candidate.createdAt.trim()
          : new Date().toISOString();
      if (!candidate.id || candidate.id !== id) {
        changed = true;
      }
      if (!candidate.createdAt || candidate.createdAt !== createdAt) {
        changed = true;
      }
      return {
        id,
        name: typeof candidate.name === 'string' ? candidate.name : '',
        role: typeof candidate.role === 'string' ? candidate.role : '',
        description: typeof candidate.description === 'string' ? candidate.description : '',
        imageUrl: typeof candidate.imageUrl === 'string' ? candidate.imageUrl : '',
        imageKey: typeof candidate.imageKey === 'string' ? candidate.imageKey : '',
        createdAt,
      } satisfies BoardMemberLocaleEntry;
    });
  };

  const enSanitized = sanitizeLocale(enArrayRaw);
  const esSanitized = sanitizeLocale(esArrayRaw);

  const order: string[] = [];
  const ensureOrder = (id: string) => {
    if (!order.includes(id)) {
      order.push(id);
    }
  };

  const map = new Map<string, { en?: BoardMemberLocaleEntry; es?: BoardMemberLocaleEntry }>();

  for (const entry of enSanitized) {
    map.set(entry.id, { en: entry, es: undefined });
    ensureOrder(entry.id);
  }

  for (const entry of esSanitized) {
    const existing = map.get(entry.id);
    if (existing) {
      existing.es = entry;
    } else {
      map.set(entry.id, { es: entry });
    }
    ensureOrder(entry.id);
  }

  const records: BoardMemberRecord[] = order.map((id) => {
    const tuple = map.get(id) ?? {};
    const enEntry = tuple.en ?? tuple.es;
    const esEntry = tuple.es ?? tuple.en;
    if (!tuple.en || !tuple.es) {
      changed = true;
    }
    const fallbackEntry: BoardMemberLocaleEntry =
      enEntry ??
      (esEntry ?? {
        id,
        name: '',
        role: '',
        description: '',
        imageUrl: '',
        imageKey: '',
        createdAt: new Date().toISOString(),
      });

    const imageUrl = enEntry?.imageUrl ?? esEntry?.imageUrl ?? fallbackEntry.imageUrl ?? '';
    const imageKey = enEntry?.imageKey ?? esEntry?.imageKey ?? fallbackEntry.imageKey ?? '';
    const createdAt = enEntry?.createdAt ?? esEntry?.createdAt ?? fallbackEntry.createdAt;

    const resolveLocale = (entry: BoardMemberLocaleEntry | undefined): BoardMemberLocaleFields => ({
      name: entry?.name ?? '',
      role: entry?.role ?? '',
      description: entry?.description ?? '',
    });

    return {
      id,
      imageUrl,
      imageKey,
      createdAt,
      en: resolveLocale(enEntry),
      es: resolveLocale(esEntry),
    } satisfies BoardMemberRecord;
  });

  const applyRecords = () => {
    content.en.boardMembers = records.map((record) => ({
      id: record.id,
      name: record.en.name,
      role: record.en.role,
      description: record.en.description,
      imageUrl: record.imageUrl,
      imageKey: record.imageKey ?? undefined,
      createdAt: record.createdAt,
    }));
    content.es.boardMembers = records.map((record) => ({
      id: record.id,
      name: record.es.name,
      role: record.es.role,
      description: record.es.description,
      imageUrl: record.imageUrl,
      imageKey: record.imageKey ?? undefined,
      createdAt: record.createdAt,
    }));
  };

  applyRecords();

  return { records, content, changed };
}

async function loadNormalizedAboutContent(): Promise<{
  records: BoardMemberRecord[];
  content: AboutContent;
  changed: boolean;
}> {
  const page = await getPageContent('about');
  const merged = mergeAboutContent(page?.content as Record<string, unknown> | undefined);
  const normalized = normalizeBoardMembers(merged);
  if (normalized.changed) {
    await upsertPageContent('about', toContentRecord(normalized.content));
  }
  return normalized;
}

function sanitizePayloadCopy(copy: BoardMemberLocaleFields): BoardMemberLocaleFields {
  return {
    name: (copy.name ?? '').toString().trim(),
    role: (copy.role ?? '').toString().trim(),
    description: (copy.description ?? '').toString().trim(),
  };
}

function applyBoardRecords(content: AboutContent, records: BoardMemberRecord[]) {
  content.en.boardMembers = records.map((record) => ({
    id: record.id,
    name: record.en.name,
    role: record.en.role,
    description: record.en.description,
    imageUrl: record.imageUrl,
    imageKey: record.imageKey ?? undefined,
    createdAt: record.createdAt,
  }));
  content.es.boardMembers = records.map((record) => ({
    id: record.id,
    name: record.es.name,
    role: record.es.role,
    description: record.es.description,
    imageUrl: record.imageUrl,
    imageKey: record.imageKey ?? undefined,
    createdAt: record.createdAt,
  }));
}

export async function listBoardMembers(): Promise<BoardMemberRecord[]> {
  const normalized = await loadNormalizedAboutContent();
  return normalized.records;
}

export async function createBoardMember(payload: BoardMemberPayload): Promise<BoardMemberRecord> {
  if (!payload.imageUrl) {
    throw new Error('Portrait image is required.');
  }

  const normalized = await loadNormalizedAboutContent();
  const records = normalized.records;
  const content = normalized.content;

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const record: BoardMemberRecord = {
    id,
    imageUrl: payload.imageUrl,
    imageKey: payload.imageKey ?? '',
    createdAt,
    en: sanitizePayloadCopy(payload.en),
    es: sanitizePayloadCopy(payload.es),
  };

  records.push(record);
  applyBoardRecords(content, records);
  await upsertPageContent('about', toContentRecord(content));

  return record;
}

export async function updateBoardMember(id: string, payload: BoardMemberPayload): Promise<BoardMemberRecord> {
  const normalized = await loadNormalizedAboutContent();
  const records = normalized.records;
  const content = normalized.content;

  const index = records.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Board member not found');
  }

  const existing = records[index];
  const updated: BoardMemberRecord = {
    id,
    imageUrl: payload.imageUrl ?? existing.imageUrl,
    imageKey: payload.imageKey ?? existing.imageKey,
    createdAt: existing.createdAt,
    en: sanitizePayloadCopy({
      name: payload.en?.name ?? existing.en.name,
      role: payload.en?.role ?? existing.en.role,
      description: payload.en?.description ?? existing.en.description,
    }),
    es: sanitizePayloadCopy({
      name: payload.es?.name ?? existing.es.name,
      role: payload.es?.role ?? existing.es.role,
      description: payload.es?.description ?? existing.es.description,
    }),
  };

  records[index] = updated;
  applyBoardRecords(content, records);
  await upsertPageContent('about', toContentRecord(content));

  return updated;
}

export async function deleteBoardMember(id: string): Promise<void> {
  const normalized = await loadNormalizedAboutContent();
  const records = normalized.records;
  const content = normalized.content;

  const nextRecords = records.filter((entry) => entry.id !== id);
  if (nextRecords.length === records.length) {
    throw new Error('Board member not found');
  }

  applyBoardRecords(content, nextRecords);
  await upsertPageContent('about', toContentRecord(content));
}
