import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../../lib/adminAuth.js';
import { getPageContent, listPageSlugs, upsertPageContent } from '../../lib/adminPages.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdminRequest(req)) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const { slug } = req.query as { slug?: string };
      if (slug) {
        const page = await getPageContent(slug);
        if (!page) {
          res.status(404).json({ message: 'Page not found.' });
          return;
        }
        res.status(200).json(page);
        return;
      }

      const slugs = await listPageSlugs();
      res.status(200).json({ slugs });
      return;
    }

    if (req.method === 'PUT') {
      const { slug, content } = (req.body ?? {}) as { slug?: string; content?: Record<string, unknown> };
      if (!slug || typeof content !== 'object' || content === null) {
        res.status(400).json({ message: 'Slug and content are required.' });
        return;
      }

      const page = await upsertPageContent(slug, content);
      res.status(200).json(page);
      return;
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin pages error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

