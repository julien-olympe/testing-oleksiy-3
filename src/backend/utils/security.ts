import { randomBytes } from 'crypto';

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function setSecurityHeaders(reply: any): void {
  // Only set headers if they haven't been sent yet
  if (reply.sent) {
    return;
  }
  
  try {
    reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'");
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  } catch (error) {
    // Ignore errors if headers are already sent
    if (!reply.sent) {
      throw error;
    }
  }
}
