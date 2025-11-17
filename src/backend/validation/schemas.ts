import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  email: z
    .string()
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be at most 255 characters')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

export const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(3, 'Username or email is required')
    .max(255, 'Username or email is too long'),
  password: z.string().min(1, 'Password is required'),
});

export const createProjectSchema = z.object({
  powerplantId: z.string().uuid('Invalid powerplant ID format'),
});

export const updateCheckupStatusSchema = z.object({
  status: z.enum(['bad', 'average', 'good'], {
    errorMap: () => ({ message: 'Status must be one of: bad, average, good' }),
  }),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const checkupStatusParamSchema = z.object({
  id: z.string().uuid('Invalid project ID format'),
  checkupId: z.string().uuid('Invalid checkup ID format'),
});
