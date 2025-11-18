import crypto from 'crypto';
import { getPageContent, upsertPageContent } from './adminPages.js';
import { pageDefaults } from './pageDefaults.js';
function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}
function mergeHomeContent(existing) {
    const base = deepClone(pageDefaults.home);
    if (!existing || typeof existing !== 'object') {
        return base;
    }
    const candidate = existing;
    const assignLanguage = (language) => {
        const source = candidate[language];
        if (!source || typeof source !== 'object')
            return;
        const langSource = source;
        const sponsorsSection = langSource.sponsors;
        const clone = deepClone(langSource);
        delete clone.sponsors;
        Object.assign(base[language], clone);
        if (sponsorsSection && typeof sponsorsSection === 'object') {
            const sponsorsObj = sponsorsSection;
            const sponsorsArray = Array.isArray(sponsorsObj.sponsors)
                ? sponsorsObj.sponsors.map((sponsor) => deepClone(sponsor))
                : undefined;
            if (sponsorsArray) {
                base[language].sponsors = {
                    heading: typeof sponsorsObj.heading === 'string' ? sponsorsObj.heading : base[language].sponsors.heading,
                    subtitle: typeof sponsorsObj.subtitle === 'string' ? sponsorsObj.subtitle : base[language].sponsors.subtitle,
                    sponsors: sponsorsArray,
                };
            }
        }
    };
    assignLanguage('en');
    assignLanguage('es');
    return base;
}
function toContentRecord(content) {
    return deepClone(content);
}
function normalizeSponsors(content) {
    const enArrayRaw = Array.isArray(content.en.sponsors?.sponsors) ? content.en.sponsors.sponsors : [];
    const esArrayRaw = Array.isArray(content.es.sponsors?.sponsors) ? content.es.sponsors.sponsors : [];
    let changed = false;
    const sanitize = (entries) => {
        return entries.map((entry) => {
            const candidate = (entry ?? {});
            const id = typeof candidate.id === 'string' && candidate.id.trim() ? candidate.id.trim() : crypto.randomUUID();
            const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt.trim()
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
                imageUrl: typeof candidate.imageUrl === 'string' ? candidate.imageUrl : '',
                imageKey: typeof candidate.imageKey === 'string' ? candidate.imageKey : undefined,
                url: typeof candidate.url === 'string' && candidate.url.trim() ? candidate.url.trim() : undefined,
                createdAt,
            };
        });
    };
    const enSanitized = sanitize(enArrayRaw);
    const esSanitized = sanitize(esArrayRaw);
    const order = [];
    const ensureOrder = (id) => {
        if (!order.includes(id)) {
            order.push(id);
        }
    };
    const map = new Map();
    for (const entry of enSanitized) {
        map.set(entry.id, entry);
        ensureOrder(entry.id);
    }
    for (const entry of esSanitized) {
        if (!map.has(entry.id)) {
            map.set(entry.id, entry);
            ensureOrder(entry.id);
        }
    }
    const records = order.map((id) => {
        const record = map.get(id);
        if (!record) {
            changed = true;
            return {
                id,
                name: '',
                imageUrl: '',
                imageKey: undefined,
                url: undefined,
                createdAt: new Date().toISOString(),
            };
        }
        return record;
    });
    const applyRecords = () => {
        const sponsorsArray = records.map((record) => ({
            id: record.id,
            name: record.name,
            imageUrl: record.imageUrl,
            imageKey: record.imageKey ?? undefined,
            url: record.url ?? undefined,
            createdAt: record.createdAt,
        }));
        content.en.sponsors = {
            ...content.en.sponsors,
            sponsors: sponsorsArray,
        };
        content.es.sponsors = {
            ...content.es.sponsors,
            sponsors: sponsorsArray,
        };
    };
    applyRecords();
    return { records, content, changed };
}
async function loadNormalizedHomeContent() {
    const page = await getPageContent('home');
    const merged = mergeHomeContent(page?.content);
    const normalized = normalizeSponsors(merged);
    if (normalized.changed) {
        await upsertPageContent('home', toContentRecord(normalized.content));
    }
    return normalized;
}
function sanitizePayload(payload) {
    return {
        name: (payload.name ?? '').toString().trim(),
        imageUrl: payload.imageUrl,
        imageKey: payload.imageKey,
        url: payload.url && payload.url.trim() ? payload.url.trim() : undefined,
    };
}
function applySponsorRecords(content, records) {
    const sponsorsArray = records.map((record) => ({
        id: record.id,
        name: record.name,
        imageUrl: record.imageUrl,
        imageKey: record.imageKey ?? undefined,
        url: record.url ?? undefined,
        createdAt: record.createdAt,
    }));
    content.en.sponsors = {
        ...content.en.sponsors,
        sponsors: sponsorsArray,
    };
    content.es.sponsors = {
        ...content.es.sponsors,
        sponsors: sponsorsArray,
    };
}
export async function listSponsors() {
    const normalized = await loadNormalizedHomeContent();
    return normalized.records;
}
export async function createSponsor(payload) {
    if (!payload.imageUrl) {
        throw new Error('Logo image is required.');
    }
    const normalized = await loadNormalizedHomeContent();
    const records = normalized.records;
    const content = normalized.content;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const sanitized = sanitizePayload(payload);
    const record = {
        id,
        name: sanitized.name,
        imageUrl: sanitized.imageUrl,
        imageKey: sanitized.imageKey,
        url: sanitized.url,
        createdAt,
    };
    records.push(record);
    applySponsorRecords(content, records);
    await upsertPageContent('home', toContentRecord(content));
    return record;
}
export async function updateSponsor(id, payload) {
    const normalized = await loadNormalizedHomeContent();
    const records = normalized.records;
    const content = normalized.content;
    const index = records.findIndex((entry) => entry.id === id);
    if (index === -1) {
        throw new Error('Sponsor not found');
    }
    const existing = records[index];
    const sanitized = sanitizePayload(payload);
    const updated = {
        id,
        name: sanitized.name || existing.name,
        imageUrl: sanitized.imageUrl ?? existing.imageUrl,
        imageKey: sanitized.imageKey ?? existing.imageKey,
        url: sanitized.url ?? existing.url,
        createdAt: existing.createdAt,
    };
    records[index] = updated;
    applySponsorRecords(content, records);
    await upsertPageContent('home', toContentRecord(content));
    return updated;
}
export async function deleteSponsor(id) {
    const normalized = await loadNormalizedHomeContent();
    const records = normalized.records;
    const content = normalized.content;
    const nextRecords = records.filter((entry) => entry.id !== id);
    if (nextRecords.length === records.length) {
        throw new Error('Sponsor not found');
    }
    applySponsorRecords(content, nextRecords);
    await upsertPageContent('home', toContentRecord(content));
}
