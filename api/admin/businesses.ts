import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, S3_BUCKET, S3_REGION } from '../../lib/awsS3.js';
import {
  listBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../../lib/adminBusinesses.js';

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
      res.status(200).json({ uploadUrl, objectUrl, key });
    } catch (error) {
      console.error('Business image upload error', error);
      res.status(500).json({ message: 'Unable to generate upload URL.' });
    }
    return;
  }

  try {
    if (req.method === 'GET') {
      const businesses = await listBusinesses();
      res.status(200).json({ businesses });
      return;
    }
    if (req.method === 'POST') {
      const { name, category, description, imageUrl, imageKey, contact, hours, address } = (req.body ?? {}) as Record<
        string,
        string
      >;
      if (!name || !category) {
        res.status(400).json({ message: 'Name and category are required.' });
        return;
      }
      const business = await createBusiness({
        name,
        category,
        description,
        imageUrl,
        imageKey,
        contact,
        hours,
        address,
      });
      res.status(201).json({ business });
      return;
    }
    if (req.method === 'PUT') {
      const { id, name, category, description, imageUrl, imageKey, contact, hours, address } = (req.body ?? {}) as Record<
        string,
        string
      >;
      if (!id) {
        res.status(400).json({ message: 'Business id is required.' });
        return;
      }
      const business = await updateBusiness(id, {
        name,
        category,
        description,
        imageUrl,
        imageKey,
        contact,
        hours,
        address,
      });
      res.status(200).json({ business });
      return;
    }
    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) {
        res.status(400).json({ message: 'Business id is required.' });
        return;
      }
      await deleteBusiness(id);
      res.status(200).json({ message: 'Business deleted.' });
      return;
    }
    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Business API error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

