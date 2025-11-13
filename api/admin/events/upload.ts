import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyAdminRequest } from '../../../lib/adminAuth';
import { getEventMetadata } from '../../../lib/adminEvents';
import { getS3Client, S3_BUCKET, S3_REGION } from '../../../lib/awsS3';

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

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { eventId, fileName, fileType } = (req.body ?? {}) as {
    eventId?: string;
    fileName?: string;
    fileType?: string;
  };

  if (!eventId || !fileName || !fileType) {
    res.status(400).json({ message: 'eventId, fileName, and fileType are required.' });
    return;
  }

  try {
    const event = await getEventMetadata(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    const extension = resolveExtension(fileName, fileType);
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

    res.status(200).json({ uploadUrl, objectUrl, key });
  } catch (error) {
    console.error('Failed to generate event upload URL', error);
    res.status(500).json({ message: 'Unable to generate upload URL.' });
  }
}

