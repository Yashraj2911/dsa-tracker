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

const optionalInt = z.number().int().min(0).optional();
const optionalPercent = z.number().min(0).max(100).optional();

/** Big-O style: O(...), e.g. O(n), O(log n), O(n^2) */
const COMPLEXITY_REGEX = /^O\(.+\)$/i;

const optionalComplexity = z
  .string()
  .max(64, "Complexity is too long")
  .optional()
  .refine(
    (val) => {
      if (val === undefined || val === "") return true;
      return COMPLEXITY_REGEX.test(val.trim());
    },
    'Use Big-O format, e.g. O(n), O(log n), O(n^2)'
  )
  .transform((val) => {
    if (val === undefined || val === "") return undefined;
    return val.trim();
  });

export const SolutionSchema = z.object({
  title: z.string().min(1, "Solution title is required"),
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
  notes: z.string().optional(),
  solveTime: optionalInt,
  runtimeMs: optionalInt,
  runtimeBeatsPercent: optionalPercent,
  memoryBeatsPercent: optionalPercent,
  timeComplexity: optionalComplexity,
  spaceComplexity: optionalComplexity,
});

export const AddSolutionSchema = SolutionSchema;

export const UpdateSolutionSchema = SolutionSchema.partial();

export type AddProblemInput = z.infer<typeof AddProblemSchema>;
export type SolutionInput = z.infer<typeof SolutionSchema>;
export type AddSolutionInput = SolutionInput;
export type UpdateSolutionInput = z.infer<typeof UpdateSolutionSchema>;

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Max 50 characters"),
  description: z.string().max(200, "Max 200 characters").optional(),
});

export const JoinGroupSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type JoinGroupInput = z.infer<typeof JoinGroupSchema>;

/** Parse optional complexity strings from form state. */
export function parseComplexityFromForm(complexity: {
  timeComplexity: string;
  spaceComplexity: string;
}): Pick<SolutionInput, "timeComplexity" | "spaceComplexity"> {
  const trim = (s: string) => {
    const t = s.trim();
    return t || undefined;
  };
  return {
    timeComplexity: trim(complexity.timeComplexity),
    spaceComplexity: trim(complexity.spaceComplexity),
  };
}

/** Parse optional metric strings from form state into numbers for Zod. */
export function parseMetricsFromForm(metrics: {
  runtimeMs: string;
  runtimeBeatsPercent: string;
  memoryBeatsPercent: string;
}): Pick<
  SolutionInput,
  "runtimeMs" | "runtimeBeatsPercent" | "memoryBeatsPercent"
> {
  const parseIntField = (s: string): number | undefined => {
    const t = s.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) return undefined;
    return n;
  };
  const parsePercent = (s: string): number | undefined => {
    const t = s.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (Number.isNaN(n) || n < 0 || n > 100) return undefined;
    return n;
  };
  return {
    runtimeMs: parseIntField(metrics.runtimeMs),
    runtimeBeatsPercent: parsePercent(metrics.runtimeBeatsPercent),
    memoryBeatsPercent: parsePercent(metrics.memoryBeatsPercent),
  };
}

export function parseSolveTimeFromForm(solveTime: string): number | undefined {
  const t = solveTime.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) return undefined;
  return n;
}
