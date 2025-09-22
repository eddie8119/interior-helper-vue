import { z } from 'zod';

export const inputStringSchema = z.object({
  inputValue: z.string().min(1, 'This is required'),
});

export type InputStringSchema = z.infer<typeof inputStringSchema>;
