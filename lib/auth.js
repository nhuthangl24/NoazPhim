import { cookies } from 'next/headers';

const SESSION_COOKIE = 'nhuthang_session';

export function encodeSession(user) {
  const data = {
    id: user._id.toString(),
    email: user.email,
    role: user.role || 'user',
    name: user.name || user.email.split('@')[0],
  };
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeSession(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function createSessionCookie(user) {
  const token = encodeSession(user);
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  };
}
