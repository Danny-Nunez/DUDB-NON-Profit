import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listBusinesses } from '../lib/adminBusinesses.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const businesses = await listBusinesses();
    res.status(200).json({ businesses });
  } catch (error) {
    console.error('Public businesses error', error);
    res.status(500).json({ message: 'Unable to load businesses.' });
  }
}

