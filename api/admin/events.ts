import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import crypto from 'crypto';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, S3_BUCKET, S3_REGION } from '../../lib/awsS3.js';
import {
  createEvent,
  deleteEvent,
  getEventMetadata,
  listEventMetadata,
  updateEvent,
} from '../../lib/adminEvents.js';

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
    return;
  }

  // Handle delete-asset requests
  if (req.query.action === 'delete-asset') {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method Not Allowed' });
      return;
    }
    const { eventId, assetKey } = (req.body ?? {}) as { eventId?: string; assetKey?: string };
    if (!eventId || !assetKey) {
      res.status(400).json({ message: 'eventId and assetKey are required.' });
      return;
    }
    try {
      const event = await getEventMetadata(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found.' });
        return;
      }
      const normalizedKey = assetKey.startsWith('events/')
        ? assetKey
        : `events/${event.folder.replace(/^\/+/, '').replace(/\/+$/u, '')}/${assetKey}`;
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: normalizedKey,
        }),
      );
      res.status(200).json({ message: 'Asset deleted.' });
    } catch (error) {
      console.error('Failed to delete event asset', error);
      res.status(500).json({ message: 'Unable to delete asset.' });
    }
    return;
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query as { id?: string };
      if (id) {
        const event = await getEventMetadata(id);
        if (!event) {
          res.status(404).json({ message: 'Event not found.' });
          return;
        }
        res.status(200).json(event);
        return;
      }

      const events = await listEventMetadata();
      res.status(200).json({ events });
      return;
    }

    if (req.method === 'POST') {
      const { folder, content } = (req.body ?? {}) as {
        folder?: string;
        content?: unknown;
      };
      if (!folder || typeof content !== 'object' || content === null) {
        res.status(400).json({ message: 'Folder and content are required.' });
        return;
      }
      const event = await createEvent({ folder, content: content as any });
      res.status(201).json({ event });
      return;
    }

    if (req.method === 'PUT') {
      const { id, folder, content } = (req.body ?? {}) as {
        id?: string;
        folder?: string;
        content?: unknown;
      };
      if (!id) {
        res.status(400).json({ message: 'Event id is required.' });
        return;
      }
      const event = await updateEvent(id, {
        folder,
        content: content as any,
      });
      res.status(200).json({ event });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) {
        res.status(400).json({ message: 'Event id is required.' });
        return;
      }
      await deleteEvent(id);
      res.status(200).json({ message: 'Event deleted.' });
      return;
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin events error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

