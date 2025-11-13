import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listEventFolders } from '../lib/s3Events.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const events = await listEventFolders();
    res.status(200).json(events);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load events from S3', error);
    res.status(500).json({ message: 'Unable to load events' });
  }
}

