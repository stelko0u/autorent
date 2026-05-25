import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!SECRET) {
  throw new Error(
    'JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables',
  );
}

const jwtSecret: string = SECRET;

export function signJwt(
  payload: Record<string, unknown>,
  options?: jwt.SignOptions
) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d', ...options });
}

export function verifyJwt<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, jwtSecret) as T;
  } catch {
    return null;
  }
}

