import type { VercelRequest, VercelResponse } from '@vercel/node';
import { credentialsMatch, getAdminCredentials } from '../../lib/adminAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    getAdminCredentials(); // ensures env vars exist
  } catch (error) {
    res.status(500).json({ message: 'Admin credentials are not configured.' });
    return;
  }

  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required.' });
    return;
  }

  const isValid = credentialsMatch(username, password);
  if (!isValid) {
    res.status(401).json({ message: 'Invalid credentials.' });
    return;
  }

  const token = Buffer.from(`${username}:${password}`).toString('base64');
  res.status(200).json({ token });
}

