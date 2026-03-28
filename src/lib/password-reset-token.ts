import jwt from 'jsonwebtoken';

export type PasswordResetJwtPayload = {
  sub: string;
  email: string;
  typ: 'password_reset';
};

function getSecret(): string {
  const s = process.env.PASSWORD_RESET_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PASSWORD_RESET_SECRET must be set in production');
    }
    console.warn(
      '[password-reset] PASSWORD_RESET_SECRET is not set; using insecure dev fallback. Set PASSWORD_RESET_SECRET in .env.local.'
    );
    return 'dev-only-insecure-password-reset-secret-do-not-use-in-prod';
  }
  return s;
}

export function createPasswordResetToken(userId: string, email: string): string {
  const payload: PasswordResetJwtPayload = {
    sub: userId,
    email,
    typ: 'password_reset',
  };
  return jwt.sign(payload, getSecret(), {
    expiresIn: '60m',
    algorithm: 'HS256',
  });
}

export function verifyPasswordResetToken(token: string): PasswordResetJwtPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & Partial<PasswordResetJwtPayload>;
    if (decoded.typ !== 'password_reset' || typeof decoded.sub !== 'string' || typeof decoded.email !== 'string') {
      return null;
    }
    return { sub: decoded.sub, email: decoded.email, typ: 'password_reset' };
  } catch {
    return null;
  }
}
