import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAILER_LITE_API = process.env.MAILER_LITE_API ?? process.env.MAILERLITE_API_KEY ?? '';

function parseBody(request: VercelRequest) {
  if (request.body) {
    if (typeof request.body === 'string') {
      try {
        return JSON.parse(request.body);
      } catch (error) {
        console.error('Failed to parse newsletter request body', error);
        return {};
      }
    }
    return request.body;
  }
  return {};
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  if (!MAILER_LITE_API) {
    response.status(500).json({ message: 'MailerLite API key is not configured.' });
    return;
  }

  try {
    const body = parseBody(request) as { email?: string; language?: string };
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      response.status(400).json({ message: 'A valid email address is required.' });
      return;
    }

    const language = body.language === 'es' ? 'es' : 'en';

    const baseUrl = 'https://connect.mailerlite.com/api';
    const headers = {
      Authorization: `Bearer ${MAILER_LITE_API}`,
      'Content-Type': 'application/json',
    } as const;

    // First check if subscriber already exists
    let existingSubscriber: any | null = null;
    try {
      const existingResponse = await fetch(`${baseUrl}/subscribers/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers,
      });
      if (existingResponse.ok) {
        existingSubscriber = await existingResponse.json().catch(() => null);
      } else if (existingResponse.status !== 404) {
        const errBody = await existingResponse.json().catch(() => ({}));
        console.error('MailerLite lookup failed', existingResponse.status, errBody);
        response.status(502).json({ message: 'MailerLite lookup failed. Please try again later.' });
        return;
      }
    } catch (lookupError) {
      console.error('MailerLite lookup error', lookupError);
      response.status(502).json({ message: 'MailerLite lookup failed. Please try again later.' });
      return;
    }

    if (existingSubscriber && existingSubscriber.status && existingSubscriber.status !== 'active') {
      response.status(409).json({
        message:
          existingSubscriber.status === 'unsubscribed'
            ? 'This email previously unsubscribed and must re-subscribe via a MailerLite form.'
            : 'Subscriber exists but is not active. Please re-subscribe through a MailerLite form.',
        code: 'reactivation_required',
      });
      return;
    }

    if (existingSubscriber && existingSubscriber.status === 'active') {
      response.status(200).json({ message: 'Already subscribed.', code: 'already_subscribed' });
      return;
    }

    const payload = {
      email,
      status: 'active',
      fields: {
        language,
      },
    };

    const mailerResponse = await fetch(`${baseUrl}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseBody = await mailerResponse.json().catch(() => ({}));

    if (!mailerResponse.ok) {
      console.error('MailerLite newsletter error', mailerResponse.status, responseBody);
      response.status(mailerResponse.status).json({
        message: responseBody?.message ?? 'MailerLite rejected the request.',
        errors: responseBody?.errors,
      });
      return;
    }

    response.status(200).json({ message: 'Subscribed successfully.', data: responseBody });
  } catch (error) {
    console.error('Newsletter subscription failed', error);
    response.status(500).json({ message: 'Unable to subscribe at this time.' });
  }
}
