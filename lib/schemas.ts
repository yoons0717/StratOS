import { z } from "zod";

export const actionStepSchema = z.object({
  order: z.number().int().min(1).max(3),
  description: z.string().min(1),
});

export const generatedActionSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["content", "outreach", "seo", "offer", "community"]),
  steps: z.array(actionStepSchema).min(1).max(3),
  magicCopy: z.string().min(1),
});

export const generateActionRequestSchema = z.object({
  input: z.string().min(1).max(500),
  userContext: z.object({
    type: z.enum(["creator", "seller", "service", "side"]),
    level: z.enum(["0-1K", "1K-10K", "10K+"]),
    businessStage: z.enum([
      "idea",
      "first-customers",
      "consistent-income",
      "scaling",
    ]),
  }),
});

export type GenerateActionRequest = z.infer<typeof generateActionRequestSchema>;

export const actionSessionRowSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  input: z.string(),
  action: generatedActionSchema,
  completed: z.boolean(),
});

export const userContextRowSchema = z.object({
  type: z.enum(["creator", "seller", "service", "side"]),
  level: z.enum(["0-1K", "1K-10K", "10K+"]),
  business_stage: z.enum([
    "idea",
    "first-customers",
    "consistent-income",
    "scaling",
  ]),
});
