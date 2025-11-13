import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAILERSEND_API = process.env.MAILERSEND_API ?? process.env.MAILERSEND_API_KEY ?? '';
const FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL ?? 'noreply@dominicanosunidosbaltimore.com';
const FROM_NAME = process.env.MAILERSEND_FROM_NAME ?? 'Dominicanos Unidos Baltimore';
const CONTACT_RECIPIENT = process.env.CONTACT_TO_EMAIL ?? 'Dominicanosbmore@gmail.com';

function parseBody(request: VercelRequest) {
  if (request.body) {
    if (typeof request.body === 'string') {
      try {
        return JSON.parse(request.body);
      } catch (error) {
        console.error('Failed to parse body', error);
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

  if (!MAILERSEND_API) {
    response.status(500).json({ message: 'MailerSend API key is not configured.' });
    return;
  }

  try {
    const body = parseBody(request) as {
      name?: string;
      email?: string;
      topic?: string;
      message?: string;
      language?: string;
    };

    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim();
    const topic = (body.topic ?? '').trim();
    const message = (body.message ?? '').trim();
    const language = body.language === 'es' ? 'es' : 'en';

    if (!name || !email || !topic || !message) {
      response.status(400).json({ message: 'All fields are required.' });
      return;
    }

    const safeTopic = topic.replace(/[^\w\s\-]/gu, '').slice(0, 120) || 'General Inquiry';
    const subjectPrefix = language === 'es' ? 'Nuevo mensaje de contacto' : 'New contact form message';
    const subject = `${subjectPrefix}: ${safeTopic}`;

    const plainText = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`;

    const htmlBody = `<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>${subject}</title>
  </head>
  <body style="font-family: Arial, sans-serif; color: #0b0d17; line-height: 1.6;">
    <h1 style="font-size: 20px; margin-bottom: 12px;">${subject}</h1>
    <p style="margin: 6px 0;"><strong>Name:</strong> ${name}</p>
    <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
    <p style="margin: 6px 0;"><strong>Topic:</strong> ${topic}</p>
    <hr style="margin: 18px 0; border: none; border-top: 1px solid #ececec;" />
    <p style="white-space: pre-wrap;">${message}</p>
  </body>
</html>`;

    const mailerResponse = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAILERSEND_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        to: [
          {
            email: CONTACT_RECIPIENT,
            name: 'Dominicanos Unidos Baltimore',
          },
        ],
        reply_to: {
          email,
          name,
        },
        subject,
        text: plainText,
        html: htmlBody,
      }),
    });

    if (!mailerResponse.ok) {
      const errorText = await mailerResponse.text();
      console.error('MailerSend error', mailerResponse.status, errorText);
      response.status(502).json({
        message: 'MailerSend rejected the request. Please try again later.',
      });
      return;
    }

    response.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact email failed', error);
    response.status(500).json({ message: 'Unable to send message. Please try again later.' });
  }
}
