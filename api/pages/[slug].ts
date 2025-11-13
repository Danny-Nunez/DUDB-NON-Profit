import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPageContent } from '../../lib/adminPages';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { slug } = req.query as { slug?: string };
  if (!slug) {
    res.status(400).json({ message: 'Page slug is required.' });
    return;
  }

  try {
    const page = await getPageContent(slug);
    if (!page) {
      res.status(404).json({ message: 'Page not found.' });
      return;
    }
    res.status(200).json(page);
  } catch (error) {
    console.error('Public page content error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

