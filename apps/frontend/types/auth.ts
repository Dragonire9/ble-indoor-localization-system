import { z } from 'zod';

// Login Input Schema
export const loginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Type exports
export type LoginInput = z.infer<typeof loginInputSchema>;
