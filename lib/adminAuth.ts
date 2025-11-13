import type { VercelRequest } from '@vercel/node';

export interface AdminCredentials {
  username: string;
  password: string;
}

export function getAdminCredentials(): AdminCredentials {
  const username = process.env.ADMIN_USERNAME ?? '';
  const password = process.env.ADMIN_PASSWORD ?? '';

  if (!username || !password) {
    throw new Error('Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.');
  }

  return { username, password };
}

export function verifyAdminRequest(req: VercelRequest): boolean {
  try {
    const { username, password } = getAdminCredentials();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }
    const base64Credentials = authHeader.substring('Basic '.length);
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [providedUser, providedPass] = decoded.split(':');
    return providedUser === username && providedPass === password;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Admin auth verification failed:', error);
    return false;
  }
}

export function credentialsMatch(username: string, password: string): boolean {
  try {
    const creds = getAdminCredentials();
    return creds.username === username && creds.password === password;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Admin credential comparison failed:', error);
    return false;
  }
}

