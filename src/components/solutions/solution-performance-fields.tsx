"use client";

import { PerformanceMetricsFields } from "./performance-metrics-fields";
import { ComplexityFields } from "./complexity-fields";
import type { SolutionPerformanceFormState } from "@/lib/solution-utils";

interface SolutionPerformanceFieldsProps {
  performance: SolutionPerformanceFormState;
  onChange: (performance: SolutionPerformanceFormState) => void;
}

export function SolutionPerformanceFields({
  performance,
  onChange,
}: SolutionPerformanceFieldsProps) {
  return (
    <div className="space-y-3">
      <PerformanceMetricsFields
        metrics={{
          runtimeMs: performance.runtimeMs,
          runtimeBeatsPercent: performance.runtimeBeatsPercent,
          memoryBeatsPercent: performance.memoryBeatsPercent,
        }}
        onChange={(metrics) => onChange({ ...performance, ...metrics })}
      />
      <ComplexityFields
        complexity={{
          timeComplexity: performance.timeComplexity,
          spaceComplexity: performance.spaceComplexity,
        }}
        onChange={(complexity) => onChange({ ...performance, ...complexity })}
      />
    </div>
  );
}
