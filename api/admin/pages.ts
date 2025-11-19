import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import { getPageContent, listPageSlugs, upsertPageContent } from '../../lib/adminPages.js';
import { getS3Client, S3_BUCKET, S3_REGION } from '../../lib/awsS3.js';
import {
  listSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from '../../lib/adminSponsors.js';

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function resolveExtension(fileName: string, fileType: string): string {
  const nameExt = fileName?.split('.').pop();
  if (nameExt && nameExt !== fileName) {
    return nameExt.toLowerCase();
  }
  const typeExt = fileType?.split('/').pop();
  if (typeExt && typeExt !== fileType) {
    return typeExt.toLowerCase();
  }
  return 'jpg';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdminRequest(req)) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Handle sponsor upload requests
  if (req.query.action === 'sponsor-upload') {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method Not Allowed' });
      return;
    }
    const { fileName, fileType } = (req.body ?? {}) as { fileName?: string; fileType?: string };
    if (!fileName || !fileType) {
      res.status(400).json({ message: 'fileName and fileType are required.' });
      return;
    }
    try {
      const extension = resolveExtension(fileName, fileType);
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
      res.status(200).json({ uploadUrl, objectUrl, key });
    } catch (error) {
      console.error('Sponsor upload error', error);
      res.status(500).json({ message: 'Unable to generate upload URL.' });
    }
    return;
  }

  // Handle sponsor CRUD requests
  if (req.query.action === 'sponsors') {
    try {
      if (req.method === 'GET') {
        const sponsors = await listSponsors();
        res.status(200).json({ sponsors });
        return;
      }

      if (req.method === 'POST') {
        const { name, imageUrl, imageKey, url, featured } = (req.body ?? {}) as Record<string, unknown>;
        if (!isNonEmpty(imageUrl) || !isNonEmpty(name)) {
          res.status(400).json({ message: 'Name and logo image are required.' });
          return;
        }
        const sponsor = await createSponsor({
          name,
          imageUrl,
          imageKey: isNonEmpty(imageKey) ? imageKey : undefined,
          url: isNonEmpty(url) ? url : undefined,
          featured: typeof featured === 'boolean' ? featured : false,
        });
        res.status(201).json({ sponsor });
        return;
      }

      if (req.method === 'PUT') {
        const { id, name, imageUrl, imageKey, url, featured } = (req.body ?? {}) as Record<string, unknown>;
        if (!isNonEmpty(id)) {
          res.status(400).json({ message: 'Sponsor id is required.' });
          return;
        }
        const sponsor = await updateSponsor(id, {
          name: isNonEmpty(name) ? name : undefined,
          imageUrl: isNonEmpty(imageUrl) ? imageUrl : undefined,
          imageKey: isNonEmpty(imageKey) ? imageKey : undefined,
          url: isNonEmpty(url) ? url : undefined,
          featured: typeof featured === 'boolean' ? featured : undefined,
        });
        res.status(200).json({ sponsor });
        return;
      }

      if (req.method === 'DELETE') {
        const { id } = req.query as { id?: string };
        if (!isNonEmpty(id)) {
          res.status(400).json({ message: 'Sponsor id is required.' });
          return;
        }
        await deleteSponsor(id);
        res.status(200).json({ message: 'Sponsor deleted.' });
        return;
      }

      res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
      console.error('Sponsors API error', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    return;
  }

  try {
    if (req.method === 'GET') {
      const { slug } = req.query as { slug?: string };
      if (slug) {
        const page = await getPageContent(slug);
        if (!page) {
          res.status(404).json({ message: 'Page not found.' });
          return;
        }
        res.status(200).json(page);
        return;
      }

      const slugs = await listPageSlugs();
      res.status(200).json({ slugs });
      return;
    }

    if (req.method === 'PUT') {
      const { slug, content } = (req.body ?? {}) as { slug?: string; content?: Record<string, unknown> };
      if (!slug || typeof content !== 'object' || content === null) {
        res.status(400).json({ message: 'Slug and content are required.' });
        return;
      }

      const page = await upsertPageContent(slug, content);
      res.status(200).json(page);
      return;
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin pages error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

