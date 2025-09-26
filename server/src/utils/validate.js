import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7)
});

export const AnswerSchema = z.object({
  answer: z.string().optional().default(''),
  useGemini: z.boolean().optional()
});

export function parseOrThrow(schema, payload){
  const res = schema.safeParse(payload);
  if (!res.success){
    const err = new Error(res.error.issues.map(i=>i.message).join('; '));
    err.status = 400; // @ts-ignore
    throw err;
  }
  return res.data;
}