import type { Solution } from "@prisma/client";

/** Solution shape used across problem detail UI. */
export type SolutionRecord = Pick<
  Solution,
  | "id"
  | "title"
  | "language"
  | "code"
  | "notes"
  | "solveTime"
  | "runtimeMs"
  | "runtimeBeatsPercent"
  | "memoryBeatsPercent"
  | "timeComplexity"
  | "spaceComplexity"
  | "createdAt"
>;
