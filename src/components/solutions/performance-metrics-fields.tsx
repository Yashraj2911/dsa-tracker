"use client";

import { Input } from "@/components/ui/input";
import { Zap, Rocket, Brain } from "lucide-react";
import type { SolutionMetricsFormState } from "@/lib/solution-utils";

interface PerformanceMetricsFieldsProps {
  metrics: SolutionMetricsFormState;
  onChange: (metrics: SolutionMetricsFormState) => void;
}

const fields: {
  key: keyof SolutionMetricsFormState;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  step?: string;
  max?: number;
}[] = [
  {
    key: "runtimeMs",
    label: "Runtime (ms)",
    placeholder: "0",
    icon: Zap,
    step: "1",
  },
  {
    key: "runtimeBeatsPercent",
    label: "Runtime beats %",
    placeholder: "100",
    icon: Rocket,
    step: "0.1",
    max: 100,
  },
  {
    key: "memoryBeatsPercent",
    label: "Memory beats %",
    placeholder: "80",
    icon: Brain,
    step: "0.1",
    max: 100,
  },
];

export function PerformanceMetricsFields({
  metrics,
  onChange,
}: PerformanceMetricsFieldsProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-3">
      <p className="mb-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
        Performance (optional)
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {fields.map(({ key, label, placeholder, icon: Icon, step, max }) => (
          <div key={key} className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Icon className="h-3 w-3 opacity-60" />
              {label}
            </label>
            <Input
              type="number"
              min={0}
              max={max}
              step={step}
              placeholder={placeholder}
              value={metrics[key]}
              onChange={(e) =>
                onChange({ ...metrics, [key]: e.target.value })
              }
              className="h-8 text-sm bg-background/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
