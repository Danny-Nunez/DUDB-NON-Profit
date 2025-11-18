import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { listEventFolders } from './lib/s3Events';
import { credentialsMatch, getAdminCredentials } from './lib/adminAuth';
import {
  listBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from './lib/adminBusinesses';
import { getPageContent, listPageSlugs, upsertPageContent } from './lib/adminPages';
import {
  listEventMetadata,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventMetadata,
} from './lib/adminEvents';
import {
  listBoardMembers,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
} from './lib/adminBoardMembers';
import {
  listSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from './lib/adminSponsors';
import { getS3Client, S3_BUCKET, S3_REGION } from './lib/awsS3';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  const MAILERSEND_API = process.env.MAILERSEND_API ?? process.env.MAILERSEND_API_KEY ?? '';
  const MAILERSEND_FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL ?? 'noreply@dominicanosunidosbaltimore.com';
  const MAILERSEND_FROM_NAME = process.env.MAILERSEND_FROM_NAME ?? 'Dominicanos Unidos Baltimore';
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'Dominicanosbmore@gmail.com';
  const MAILER_LITE_API = process.env.MAILER_LITE_API ?? process.env.MAILERLITE_API_KEY ?? '';

  async function readJsonBody(req: any): Promise<any> {
    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      req
        .on('data', (chunk: Uint8Array) => chunks.push(chunk))
        .on('end', () => resolve())
        .on('error', (error: unknown) => reject(error));
    });
    if (chunks.length === 0) return {};
    const raw = Buffer.concat(chunks).toString('utf8');
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to parse JSON body', error);
      return {};
    }
  }

  function sendJson(res: any, statusCode: number, payload: unknown) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  }

  function isAdminAuthorized(req: any): boolean {
    try {
      const { username, password } = getAdminCredentials();
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return false;
      }
      const base64 = authHeader.substring('Basic '.length);
      const expected = Buffer.from(`${username}:${password}`).toString('base64');
      return base64 === expected;
    } catch (error) {
      console.error('Admin authorization failed:', error);
      return false;
    }
  }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
    plugins: [
      react(),
      {
        name: 'dev-api-handlers',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next();
            const url = new URL(req.url, 'http://localhost');
            const { pathname } = url;

            if (pathname === '/api/events') {
              if (req.method && req.method !== 'GET') {
                sendJson(res, 405, { message: 'Method Not Allowed' });
                return;
              }
              try {
                const events = await listEventFolders();
                sendJson(res, 200, events);
              } catch (error) {
                console.error('Failed to load events from S3', error);
                sendJson(res, 500, { message: 'Unable to load events' });
              }
              return;
            }

            if (pathname === '/api/contact') {
              if (req.method !== 'POST') {
                sendJson(res, 405, { message: 'Method Not Allowed' });
                return;
              }
              if (!MAILERSEND_API) {
                sendJson(res, 500, { message: 'MailerSend API key is not configured.' });
                return;
              }
              try {
                const body = await readJsonBody(req);
                const name = String(body?.name ?? '').trim();
                const email = String(body?.email ?? '').trim();
                const topic = String(body?.topic ?? '').trim();
                const message = String(body?.message ?? '').trim();
                const language = body?.language === 'es' ? 'es' : 'en';

                if (!name || !email || !topic || !message) {
                  sendJson(res, 400, { message: 'All fields are required.' });
                  return;
                }

                const safeTopic = topic.replace(/[^\w\s\-]/gu, '').slice(0, 120) || 'General Inquiry';
                const prefix = language === 'es' ? 'Nuevo mensaje de contacto' : 'New contact form message';
                const subject = `${prefix}: ${safeTopic}`;

                const plainText = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`;
                const htmlBody = `<!DOCTYPE html><html><head><meta charSet="utf-8" /><title>${subject}</title></head><body style="font-family: Arial, sans-serif; color: #0b0d17; line-height: 1.6;"><h1 style="font-size: 20px; margin-bottom: 12px;">${subject}</h1><p style="margin: 6px 0;"><strong>Name:</strong> ${name}</p><p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p><p style="margin: 6px 0;"><strong>Topic:</strong> ${topic}</p><hr style="margin: 18px 0; border: none; border-top: 1px solid #ececec;" /><p style="white-space: pre-wrap;">${message}</p></body></html>`;

                const mailerResponse = await fetch('https://api.mailersend.com/v1/email', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${MAILERSEND_API}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    from: { email: MAILERSEND_FROM_EMAIL, name: MAILERSEND_FROM_NAME },
                    to: [{ email: CONTACT_TO_EMAIL, name: 'Dominicanos Unidos Baltimore' }],
                    reply_to: { email, name },
                    subject,
                    text: plainText,
                    html: htmlBody,
                  }),
                });

                if (!mailerResponse.ok) {
                  const text = await mailerResponse.text();
                  console.error('MailerSend error (dev)', mailerResponse.status, text);
                  sendJson(res, 502, { message: 'MailerSend rejected the request. Please try again later.' });
                  return;
                }

                sendJson(res, 200, { message: 'Message sent successfully.' });
              } catch (error) {
                console.error('Contact form error (dev)', error);
                sendJson(res, 500, { message: 'Unable to send message. Please try again later.' });
              }
              return;
            }

            if (pathname === '/api/newsletter') {
              if (req.method !== 'POST') {
                sendJson(res, 405, { message: 'Method Not Allowed' });
                return;
              }
              if (!MAILER_LITE_API) {
                sendJson(res, 500, { message: 'MailerLite API key is not configured.' });
                return;
              }
              try {
                const body = await readJsonBody(req);
                const email = String(body?.email ?? '').trim().toLowerCase();
                const language = body?.language === 'es' ? 'es' : 'en';
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  sendJson(res, 400, { message: 'A valid email address is required.' });
                  return;
                }

                const baseUrl = 'https://connect.mailerlite.com/api';
                const headers = {
                  Authorization: `Bearer ${MAILER_LITE_API}`,
                  'Content-Type': 'application/json',
                } as const;

                let existingSubscriber: any | null = null;
                try {
                  const lookupResponse = await fetch(`${baseUrl}/subscribers/${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers,
                  });
                  if (lookupResponse.ok) {
                    existingSubscriber = await lookupResponse.json().catch(() => null);
                  } else if (lookupResponse.status !== 404) {
                    const err = await lookupResponse.json().catch(() => ({}));
                    console.error('MailerLite lookup error (dev)', lookupResponse.status, err);
                    sendJson(res, 502, { message: 'MailerLite lookup failed. Please try again later.' });
                    return;
                  }
                } catch (lookupError) {
                  console.error('MailerLite lookup error (dev)', lookupError);
                  sendJson(res, 502, { message: 'MailerLite lookup failed. Please try again later.' });
                  return;
                }

                if (existingSubscriber && existingSubscriber.status && existingSubscriber.status !== 'active') {
                  sendJson(res, 409, {
                    message:
                      existingSubscriber.status === 'unsubscribed'
                        ? 'This email previously unsubscribed and must re-subscribe via a MailerLite form.'
                        : 'Subscriber exists but is not active. Please re-subscribe through a MailerLite form.',
                    code: 'reactivation_required',
                  });
                  return;
                }

                if (existingSubscriber && existingSubscriber.status === 'active') {
                  sendJson(res, 200, { message: 'Already subscribed.', code: 'already_subscribed' });
                  return;
                }

                const payload = {
                  email,
                  status: 'active',
                  fields: {
                    language,
                  },
                };

                const mailerResponse = await fetch(`${baseUrl}/subscribers`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(payload),
                });

                const bodyJson = await mailerResponse.json().catch(() => ({}));

                if (!mailerResponse.ok) {
                  console.error('MailerLite newsletter error (dev)', mailerResponse.status, bodyJson);
                  sendJson(res, mailerResponse.status, {
                    message: bodyJson?.message ?? 'MailerLite rejected the request.',
                    errors: bodyJson?.errors,
                  });
                  return;
                }

                sendJson(res, 200, { message: 'Subscribed successfully.', data: bodyJson });
              } catch (error) {
                console.error('Newsletter handler error (dev)', error);
                sendJson(res, 500, { message: 'Unable to subscribe at this time.' });
              }
              return;
            }

            if (pathname === '/api/businesses') {
              if (req.method && req.method !== 'GET') {
                sendJson(res, 405, { message: 'Method Not Allowed' });
                return;
              }
              try {
                const businesses = await listBusinesses();
                sendJson(res, 200, { businesses });
              } catch (error) {
                console.error('Public businesses error:', error);
                sendJson(res, 500, { message: 'Unable to load businesses.' });
              }
              return;
            }

            if (pathname === '/api/admin/login') {
              if (req.method !== 'POST') {
                sendJson(res, 405, { message: 'Method Not Allowed' });
                return;
              }
              try {
                const body = await readJsonBody(req);
                const { username, password } = body ?? {};
                if (!credentialsMatch(username ?? '', password ?? '')) {
                  sendJson(res, 401, { message: 'Invalid credentials.' });
                  return;
                }
                const token = Buffer.from(`${username}:${password}`).toString('base64');
                sendJson(res, 200, { token });
              } catch (error) {
                console.error('Admin login error:', error);
                sendJson(res, 500, { message: 'Internal server error' });
              }
              return;
            }

            if (pathname === '/api/admin/businesses') {
              if (!isAdminAuthorized(req)) {
                sendJson(res, 401, { message: 'Unauthorized' });
                return;
              }

              // Handle upload requests
              if (url.searchParams.get('action') === 'upload') {
                if (req.method !== 'POST') {
                  sendJson(res, 405, { message: 'Method Not Allowed' });
                  return;
                }
                try {
                  const body = await readJsonBody(req);
                  const { fileName, fileType } = body ?? {};
                  if (!fileName || !fileType) {
                    sendJson(res, 400, { message: 'fileName and fileType are required.' });
                    return;
                  }
                  const extension = (() => {
                    const fromName = String(fileName).split('.').pop();
                    if (fromName && fromName !== fileName) return fromName.toLowerCase();
                    const fromType = String(fileType).split('/').pop();
                    if (fromType && fromType !== fileType) return fromType.toLowerCase();
                    return 'jpg';
                  })();
                  const key = `businesses/${crypto.randomUUID()}.${extension}`;
                  const client = getS3Client();
                  const command = new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                    ContentType: fileType,
                    CacheControl: 'public, max-age=31536000, immutable',
                  });
                  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
                  const objectUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
                  sendJson(res, 200, { uploadUrl, objectUrl, key });
                } catch (error) {
                  console.error('Business image upload error:', error);
                  sendJson(res, 500, { message: 'Unable to generate upload URL.' });
                }
                return;
              }

              try {
                if (req.method === 'GET') {
                  const businesses = await listBusinesses();
                  sendJson(res, 200, { businesses });
                  return;
                }
                if (req.method === 'POST') {
                  const body = await readJsonBody(req);
                  if (!body.name || !body.category) {
                    sendJson(res, 400, { message: 'Name and category are required.' });
                    return;
                  }
                  const business = await createBusiness(body);
                  sendJson(res, 201, { business });
                  return;
                }
                if (req.method === 'PUT') {
                  const body = await readJsonBody(req);
                  if (!body.id) {
                    sendJson(res, 400, { message: 'Business id is required.' });
                    return;
                  }
                  const business = await updateBusiness(body.id, body);
                  sendJson(res, 200, { business });
                  return;
                }
                if (req.method === 'DELETE') {
                  const id = url.searchParams.get('id');
                  if (!id) {
                    sendJson(res, 400, { message: 'Business id is required.' });
                    return;
                  }
                  await deleteBusiness(id);
                  sendJson(res, 200, { message: 'Business deleted.' });
                  return;
                }
                sendJson(res, 405, { message: 'Method Not Allowed' });
              } catch (error) {
                console.error('Admin businesses error:', error);
                sendJson(res, 500, { message: 'Internal server error' });
              }
              return;
            }

            if (pathname === '/api/admin/board-members') {
              const isNonEmpty = (value: unknown): value is string =>
                typeof value === 'string' && value.trim().length > 0;

              if (!isAdminAuthorized(req)) {
                sendJson(res, 401, { message: 'Unauthorized' });
                return;
              }

              // Handle upload requests
              if (url.searchParams.get('action') === 'upload') {
                if (req.method !== 'POST') {
                  sendJson(res, 405, { message: 'Method Not Allowed' });
                  return;
                }
                try {
                  const body = await readJsonBody(req);
                  const { fileName, fileType } = body ?? {};
                  if (!fileName || !fileType) {
                    sendJson(res, 400, { message: 'fileName and fileType are required.' });
                    return;
                  }
                  const extension = (() => {
                    const fromName = String(fileName).split('.').pop();
                    if (fromName && fromName !== fileName) return fromName.toLowerCase();
                    const fromType = String(fileType).split('/').pop();
                    if (fromType && fromType !== fileType) return fromType.toLowerCase();
                    return 'jpg';
                  })();
                  const key = `boardmembers/${crypto.randomUUID()}.${extension}`;
                  const client = getS3Client();
                  const command = new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                    ContentType: fileType,
                    CacheControl: 'public, max-age=31536000, immutable',
                  });
                  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
                  const objectUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
                  sendJson(res, 200, { uploadUrl, objectUrl, key });
                } catch (error) {
                  console.error('Board member upload error (dev):', error);
                  sendJson(res, 500, { message: 'Unable to generate upload URL.' });
                }
                return;
              }

              try {
                if (req.method === 'GET') {
                  const members = await listBoardMembers();
                  sendJson(res, 200, { members });
                  return;
                }
                if (req.method === 'POST') {
                  const body = await readJsonBody(req);
                  const { imageUrl, imageKey, en, es } = body ?? {};
                  if (!isNonEmpty(imageUrl) || typeof en !== 'object' || typeof es !== 'object') {
                    sendJson(res, 400, { message: 'Portrait, English, and Spanish details are required.' });
                    return;
                  }
                  const enFields = en as Record<string, unknown>;
                  const esFields = es as Record<string, unknown>;
                  if (
                    !isNonEmpty(enFields.name) ||
                    !isNonEmpty(enFields.role) ||
                    !isNonEmpty(esFields.name) ||
                    !isNonEmpty(esFields.role)
                  ) {
                    sendJson(res, 400, { message: 'Name and role are required in both languages.' });
                    return;
                  }
                  const member = await createBoardMember({
                    imageUrl,
                    imageKey: isNonEmpty(imageKey) ? imageKey : undefined,
                    en: {
                      name: String(enFields.name ?? ''),
                      role: String(enFields.role ?? ''),
                      description: String(enFields.description ?? ''),
                    },
                    es: {
                      name: String(esFields.name ?? ''),
                      role: String(esFields.role ?? ''),
                      description: String(esFields.description ?? ''),
                    },
                  });
                  sendJson(res, 201, { member });
                  return;
                }
                if (req.method === 'PUT') {
                  const body = await readJsonBody(req);
                  const { id, imageUrl, imageKey, en, es } = body ?? {};
                  if (!isNonEmpty(id) || typeof en !== 'object' || typeof es !== 'object') {
                    sendJson(res, 400, { message: 'Board member id and bilingual details are required.' });
                    return;
                  }
                  const enFields = en as Record<string, unknown>;
                  const esFields = es as Record<string, unknown>;
                  if (
                    !isNonEmpty(enFields.name) ||
                    !isNonEmpty(enFields.role) ||
                    !isNonEmpty(esFields.name) ||
                    !isNonEmpty(esFields.role)
                  ) {
                    sendJson(res, 400, { message: 'Name and role are required in both languages.' });
                    return;
                  }
                  const member = await updateBoardMember(id, {
                    imageUrl: isNonEmpty(imageUrl) ? imageUrl : undefined,
                    imageKey: isNonEmpty(imageKey) ? imageKey : undefined,
                    en: {
                      name: String(enFields.name ?? ''),
                      role: String(enFields.role ?? ''),
                      description: String(enFields.description ?? ''),
                    },
                    es: {
                      name: String(esFields.name ?? ''),
                      role: String(esFields.role ?? ''),
                      description: String(esFields.description ?? ''),
                    },
                  });
                  sendJson(res, 200, { member });
                  return;
                }
                if (req.method === 'DELETE') {
                  const id = url.searchParams.get('id');
                  if (!isNonEmpty(id)) {
                    sendJson(res, 400, { message: 'Board member id is required.' });
                    return;
                  }
                  await deleteBoardMember(id);
                  sendJson(res, 200, { message: 'Board member deleted.' });
                  return;
                }
                sendJson(res, 405, { message: 'Method Not Allowed' });
              } catch (error) {
                console.error('Admin board members error:', error);
                sendJson(res, 500, { message: 'Internal server error' });
              }
              return;
            }


            if (pathname === '/api/admin/events') {
              if (!isAdminAuthorized(req)) {
                sendJson(res, 401, { message: 'Unauthorized' });
                return;
              }

              // Handle upload requests
              if (url.searchParams.get('action') === 'upload') {
                if (req.method !== 'POST') {
                  sendJson(res, 405, { message: 'Method Not Allowed' });
                  return;
                }
                try {
                  const body = await readJsonBody(req);
                  const { eventId, fileName, fileType } = body ?? {};
                  if (!eventId || !fileName || !fileType) {
                    sendJson(res, 400, { message: 'eventId, fileName, and fileType are required.' });
                    return;
                  }
                  const event = await getEventMetadata(eventId);
                  if (!event) {
                    sendJson(res, 404, { message: 'Event not found.' });
                    return;
                  }
                  const extension = (() => {
                    const fromName = String(fileName).split('.').pop();
                    if (fromName && fromName !== fileName) return fromName.toLowerCase();
                    const fromType = String(fileType).split('/').pop();
                    if (fromType && fromType !== fileType) return fromType.toLowerCase();
                    return 'jpg';
                  })();
                  const safeFolder = event.folder.replace(/^\/+/, '').replace(/\/+$/u, '');
                  const key = `events/${safeFolder}/${crypto.randomUUID()}.${extension}`;
                  const client = getS3Client();
                  const command = new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                    ContentType: fileType,
                    CacheControl: 'public, max-age=31536000, immutable',
                  });
                  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
                  const objectUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
                  sendJson(res, 200, { uploadUrl, objectUrl, key });
                } catch (error) {
                  console.error('Event image upload error:', error);
                  sendJson(res, 500, { message: 'Unable to generate upload URL.' });
                }
                return;
              }

              // Handle delete-asset requests
              if (url.searchParams.get('action') === 'delete-asset') {
                if (req.method !== 'POST') {
                  sendJson(res, 405, { message: 'Method Not Allowed' });
                  return;
                }
                try {
                  const body = await readJsonBody(req);
                  const { eventId, assetKey } = body ?? {};
                  if (!eventId || !assetKey) {
                    sendJson(res, 400, { message: 'eventId and assetKey are required.' });
                    return;
                  }
                  const event = await getEventMetadata(eventId);
                  if (!event) {
                    sendJson(res, 404, { message: 'Event not found.' });
                    return;
                  }
                  const safeFolder = event.folder.replace(/^\/+/, '').replace(/\/+$/u, '');
                  const normalizedKey =
                    typeof assetKey === 'string' && assetKey.startsWith('events/')
                      ? assetKey
                      : `events/${safeFolder}/${assetKey}`;
                  const client = getS3Client();
                  await client.send(
                    new DeleteObjectCommand({
                      Bucket: S3_BUCKET,
                      Key: normalizedKey,
                    }),
                  );
                  sendJson(res, 200, { message: 'Asset deleted.' });
                } catch (error) {
                  console.error('Event asset delete error:', error);
                  sendJson(res, 500, { message: 'Unable to delete asset.' });
                }
                return;
              }

              try {
                if (req.method === 'GET') {
                  const id = url.searchParams.get('id');
                  if (id) {
                    const event = await listEventMetadata();
                    const match = event.find((item) => item.id === id);
                    if (!match) {
                      sendJson(res, 404, { message: 'Event not found.' });
                      return;
                    }
                    sendJson(res, 200, match);
                    return;
                  }
                  const events = await listEventMetadata();
                  sendJson(res, 200, { events });
                  return;
                }
                if (req.method === 'POST') {
                  const body = await readJsonBody(req);
                  if (!body.folder || typeof body.content !== 'object' || body.content === null) {
                    sendJson(res, 400, { message: 'Folder and content are required.' });
                    return;
                  }
                  const event = await createEvent(body);
                  sendJson(res, 201, { event });
                  return;
                }
                if (req.method === 'PUT') {
                  const body = await readJsonBody(req);
                  if (!body.id) {
                    sendJson(res, 400, { message: 'Event id is required.' });
                    return;
                  }
                  const event = await updateEvent(body.id, body);
                  sendJson(res, 200, { event });
                  return;
                }
                if (req.method === 'DELETE') {
                  const id = url.searchParams.get('id');
                  if (!id) {
                    sendJson(res, 400, { message: 'Event id is required.' });
                    return;
                  }
                  await deleteEvent(id);
                  sendJson(res, 200, { message: 'Event deleted.' });
                  return;
                }
                sendJson(res, 405, { message: 'Method Not Allowed' });
              } catch (error) {
                console.error('Admin events error:', error);
                sendJson(res, 500, { message: 'Internal server error' });
              }
              return;
            }

            if (pathname === '/api/admin/pages') {
              if (!isAdminAuthorized(req)) {
                sendJson(res, 401, { message: 'Unauthorized' });
                return;
              }

              // Handle sponsor upload requests
              if (url.searchParams.get('action') === 'sponsor-upload') {
                if (req.method !== 'POST') {
                  sendJson(res, 405, { message: 'Method Not Allowed' });
                  return;
                }
                try {
                  const body = await readJsonBody(req);
                  const { fileName, fileType } = body ?? {};
                  if (!fileName || !fileType) {
                    sendJson(res, 400, { message: 'fileName and fileType are required.' });
                    return;
                  }
                  const extension = (() => {
                    const fromName = String(fileName).split('.').pop();
                    if (fromName && fromName !== fileName) return fromName.toLowerCase();
                    const fromType = String(fileType).split('/').pop();
                    if (fromType && fromType !== fileType) return fromType.toLowerCase();
                    return 'jpg';
                  })();
                  const key = `sponsors/${crypto.randomUUID()}.${extension}`;
                  const client = getS3Client();
                  const command = new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                    ContentType: fileType,
                    CacheControl: 'public, max-age=31536000, immutable',
                  });
                  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
                  const objectUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
                  sendJson(res, 200, { uploadUrl, objectUrl, key });
                } catch (error) {
                  console.error('Sponsor upload error (dev):', error);
                  sendJson(res, 500, { message: 'Unable to generate upload URL.' });
                }
                return;
              }

              // Handle sponsor CRUD requests
              if (url.searchParams.get('action') === 'sponsors') {
                try {
                  if (req.method === 'GET') {
                    const sponsors = await listSponsors();
                    sendJson(res, 200, { sponsors });
                    return;
                  }

                  if (req.method === 'POST') {
                    const body = await readJsonBody(req);
                    const { name, imageUrl, imageKey, url } = body ?? {};
                    if (!name || !imageUrl) {
                      sendJson(res, 400, { message: 'Name and logo image are required.' });
                      return;
                    }
                    const sponsor = await createSponsor({
                      name,
                      imageUrl,
                      imageKey,
                      url,
                    });
                    sendJson(res, 201, { sponsor });
                    return;
                  }

                  if (req.method === 'PUT') {
                    const body = await readJsonBody(req);
                    const { id, name, imageUrl, imageKey, url } = body ?? {};
                    if (!id) {
                      sendJson(res, 400, { message: 'Sponsor id is required.' });
                      return;
                    }
                    const sponsor = await updateSponsor(id, {
                      name,
                      imageUrl,
                      imageKey,
                      url,
                    });
                    sendJson(res, 200, { sponsor });
                    return;
                  }

                  if (req.method === 'DELETE') {
                    const id = url.searchParams.get('id');
                    if (!id) {
                      sendJson(res, 400, { message: 'Sponsor id is required.' });
                      return;
                    }
                    await deleteSponsor(id);
                    sendJson(res, 200, { message: 'Sponsor deleted.' });
                    return;
                  }

                  sendJson(res, 405, { message: 'Method Not Allowed' });
                } catch (error) {
                  console.error('Sponsors API error (dev):', error);
                  sendJson(res, 500, { message: 'Internal server error' });
                }
                return;
              }

              try {
                if (req.method === 'GET') {
                  const slug = url.searchParams.get('slug');
                  if (slug) {
                    const page = await getPageContent(slug);
                    if (!page) {
                      sendJson(res, 404, { message: 'Page not found.' });
                      return;
                    }
                    sendJson(res, 200, page);
                    return;
                  }
                  const slugs = await listPageSlugs();
                  sendJson(res, 200, { slugs });
                  return;
                }
                if (req.method === 'PUT') {
                  const body = await readJsonBody(req);
                  if (!body.slug || typeof body.content !== 'object' || body.content === null) {
                    sendJson(res, 400, { message: 'Slug and content are required.' });
                    return;
                  }
                  const page = await upsertPageContent(body.slug, body.content);
                  sendJson(res, 200, page);
                  return;
                }
                sendJson(res, 405, { message: 'Method Not Allowed' });
              } catch (error) {
                console.error('Admin pages error:', error);
                sendJson(res, 500, { message: 'Internal server error' });
              }
              return;
            }

            if (pathname.startsWith('/api/pages/')) {
              if (req.method !== 'GET') {
                sendJson(res, 405, { message: 'Method Not Allowed' });
                return;
              }
              const slug = pathname.replace('/api/pages/', '');
              if (!slug) {
                sendJson(res, 400, { message: 'Page slug is required.' });
                return;
              }
              try {
                const page = await getPageContent(slug);
                if (!page) {
                  sendJson(res, 404, { message: 'Page not found.' });
                  return;
                }
                sendJson(res, 200, page);
              } catch (error) {
                console.error('Public page content error:', error);
                sendJson(res, 500, { message: 'Internal server error' });
              }
              return;
            }

            next();
          });
        },
      },
    ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
      },
    },
    };
});
