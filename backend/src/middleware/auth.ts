import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError, ErrorType, logError } from '../utils/errors';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    logError({
      endpoint: request.url,
      error,
    });
    sendError(reply, 401, ErrorType.UNAUTHORIZED, 'Unauthorized. Please login.');
  }
}
