import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import {
  createEvent,
  deleteEvent,
  getEventMetadata,
  listEventMetadata,
  updateEvent,
} from '../../lib/adminEvents.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdminRequest(req)) {
    res.status(401).json({ message: 'Unauthorized' });
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

