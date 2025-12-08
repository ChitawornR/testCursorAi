import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWTSECRET || process.env.JWT_SECRET;
const TOKEN_EXP_SECONDS = 60 * 60; // 1 hour
const TOKEN_COOKIE = 'session_token';

if (!JWT_SECRET) {
  throw new Error('Missing JWTSECRET environment variable');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export type SessionPayload = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXP_SECONDS}s`)
    .sign(secretKey);
  return jwt;
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify<SessionPayload>(token, secretKey);
  return payload;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXP_SECONDS,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

