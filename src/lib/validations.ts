import { z } from "zod";

export const AddProblemSchema = z.object({
  url: z.string().min(1, "URL is required"),
  title: z.string().min(1, "Title is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    error: "Select a difficulty",
  }),
  tags: z.array(z.string()).default([]),
  slug: z.string().min(1, "Slug is required"),
});

export const AddSolutionSchema = z.object({
  title: z.string().min(1, "Solution title is required"),
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
  notes: z.string().optional(),
  solveTime: z.coerce.number().min(0).optional(),
});

export type AddProblemInput = z.infer<typeof AddProblemSchema>;
export type AddSolutionInput = z.infer<typeof AddSolutionSchema>;

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Max 50 characters"),
  description: z.string().max(200, "Max 200 characters").optional(),
});

export const JoinGroupSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type JoinGroupInput = z.infer<typeof JoinGroupSchema>;
