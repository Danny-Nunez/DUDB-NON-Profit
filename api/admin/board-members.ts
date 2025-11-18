import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, S3_BUCKET, S3_REGION } from '../../lib/awsS3.js';
import {
  listBoardMembers,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
} from '../../lib/adminBoardMembers.js';

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

  // Handle upload requests
  if (req.query.action === 'upload') {
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
      res.status(200).json({ uploadUrl, objectUrl, key });
    } catch (error) {
      console.error('Board member upload error', error);
      res.status(500).json({ message: 'Unable to generate upload URL.' });
    }
    return;
  }

  try {
    if (req.method === 'GET') {
      const members = await listBoardMembers();
      res.status(200).json({ members });
      return;
    }

    if (req.method === 'POST') {
      const { imageUrl, imageKey, en, es } = (req.body ?? {}) as Record<string, unknown>;
      if (!isNonEmpty(imageUrl) || typeof en !== 'object' || typeof es !== 'object') {
        res.status(400).json({ message: 'Portrait, English, and Spanish details are required.' });
        return;
      }
      const enFields = en as Record<string, unknown>;
      const esFields = es as Record<string, unknown>;
      if (!isNonEmpty(enFields.name) || !isNonEmpty(enFields.role) || !isNonEmpty(esFields.name) || !isNonEmpty(esFields.role)) {
        res.status(400).json({ message: 'Name and role are required in both languages.' });
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
      res.status(201).json({ member });
      return;
    }

    if (req.method === 'PUT') {
      const { id, imageUrl, imageKey, en, es } = (req.body ?? {}) as Record<string, unknown>;
      if (!isNonEmpty(id)) {
        res.status(400).json({ message: 'Board member id is required.' });
        return;
      }
      if (typeof en !== 'object' || typeof es !== 'object') {
        res.status(400).json({ message: 'English and Spanish details are required.' });
        return;
      }
      const enFields = en as Record<string, unknown>;
      const esFields = es as Record<string, unknown>;
      if (!isNonEmpty(enFields.name) || !isNonEmpty(enFields.role) || !isNonEmpty(esFields.name) || !isNonEmpty(esFields.role)) {
        res.status(400).json({ message: 'Name and role are required in both languages.' });
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
      res.status(200).json({ member });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!isNonEmpty(id)) {
        res.status(400).json({ message: 'Board member id is required.' });
        return;
      }
      await deleteBoardMember(id);
      res.status(200).json({ message: 'Board member deleted.' });
      return;
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Board members API error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
