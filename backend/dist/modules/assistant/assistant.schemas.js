import { z } from "zod";
const assistantMessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2000),
});
export const assistantConsultSchema = z.object({
    question: z.string().trim().min(3).max(1000).optional(),
    history: z.array(assistantMessageSchema).max(12).default([]),
});
