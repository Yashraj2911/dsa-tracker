import type { Solution } from "@prisma/client";

/** Runtime / beats metrics (numeric form strings). */
export type SolutionMetricsFormState = {
  runtimeMs: string;
  runtimeBeatsPercent: string;
  memoryBeatsPercent: string;
};

/** Algorithm complexity (string form). */
export type SolutionComplexityFormState = {
  timeComplexity: string;
  spaceComplexity: string;
};

export type SolutionPerformanceFormState = SolutionMetricsFormState &
  SolutionComplexityFormState;

export const emptyMetricsFormState = (): SolutionMetricsFormState => ({
  runtimeMs: "",
  runtimeBeatsPercent: "",
  memoryBeatsPercent: "",
});

export const emptyComplexityFormState = (): SolutionComplexityFormState => ({
  timeComplexity: "",
  spaceComplexity: "",
});

export const emptyPerformanceFormState = (): SolutionPerformanceFormState => ({
  ...emptyMetricsFormState(),
  ...emptyComplexityFormState(),
});

type SolutionPerformanceSource = Pick<
  Solution,
  | "runtimeMs"
  | "runtimeBeatsPercent"
  | "memoryBeatsPercent"
  | "timeComplexity"
  | "spaceComplexity"
>;

export function metricsFromSolution(
  solution: SolutionPerformanceSource
): SolutionMetricsFormState {
  return {
    runtimeMs:
      solution.runtimeMs !== null && solution.runtimeMs !== undefined
        ? String(solution.runtimeMs)
        : "",
    runtimeBeatsPercent:
      solution.runtimeBeatsPercent !== null &&
      solution.runtimeBeatsPercent !== undefined
        ? String(solution.runtimeBeatsPercent)
        : "",
    memoryBeatsPercent:
      solution.memoryBeatsPercent !== null &&
      solution.memoryBeatsPercent !== undefined
        ? String(solution.memoryBeatsPercent)
        : "",
  };
}

export function complexityFromSolution(
  solution: SolutionPerformanceSource
): SolutionComplexityFormState {
  return {
    timeComplexity: solution.timeComplexity ?? "",
    spaceComplexity: solution.spaceComplexity ?? "",
  };
}

export function performanceFromSolution(
  solution: SolutionPerformanceSource
): SolutionPerformanceFormState {
  return {
    ...metricsFromSolution(solution),
    ...complexityFromSolution(solution),
  };
}

export function hasPerformanceMetrics(
  solution: Pick<
    Solution,
    | "runtimeMs"
    | "runtimeBeatsPercent"
    | "memoryBeatsPercent"
    | "solveTime"
    | "timeComplexity"
    | "spaceComplexity"
  >
): boolean {
  return (
    solution.runtimeMs !== null ||
    solution.runtimeBeatsPercent !== null ||
    solution.memoryBeatsPercent !== null ||
    solution.solveTime !== null ||
    (solution.timeComplexity !== null && solution.timeComplexity !== "") ||
    (solution.spaceComplexity !== null && solution.spaceComplexity !== "")
  );
}
