import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { verifyAdminRequest } from '../../../lib/adminAuth';
import { getEventMetadata } from '../../../lib/adminEvents';
import { getS3Client, S3_BUCKET } from '../../../lib/awsS3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdminRequest(req)) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

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
}

