import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import {
  listBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../../lib/adminBusinesses.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdminRequest(req)) {
    res.status(401).json({ message: 'Unauthorized' });
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

