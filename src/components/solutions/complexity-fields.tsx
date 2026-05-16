"use client";

import { Input } from "@/components/ui/input";
import { Timer, HardDrive } from "lucide-react";
import { COMMON_COMPLEXITIES } from "@/constants/complexity";
import type { SolutionComplexityFormState } from "@/lib/solution-utils";

interface ComplexityFieldsProps {
  complexity: SolutionComplexityFormState;
  onChange: (complexity: SolutionComplexityFormState) => void;
}

const fields: {
  key: keyof SolutionComplexityFormState;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  listId: string;
}[] = [
  {
    key: "timeComplexity",
    label: "Time complexity",
    placeholder: "O(n log n)",
    icon: Timer,
    listId: "time-complexity-suggestions",
  },
  {
    key: "spaceComplexity",
    label: "Space complexity",
    placeholder: "O(1)",
    icon: HardDrive,
    listId: "space-complexity-suggestions",
  },
];

export function ComplexityFields({
  complexity,
  onChange,
}: ComplexityFieldsProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-violet-500/5 to-muted/10 p-3">
      <p className="mb-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
        Complexity (optional)
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {fields.map(({ key, label, placeholder, icon: Icon, listId }) => (
          <div key={key} className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Icon className="h-3 w-3 opacity-60" />
              {label}
            </label>
            <Input
              list={listId}
              placeholder={placeholder}
              value={complexity[key]}
              onChange={(e) =>
                onChange({ ...complexity, [key]: e.target.value })
              }
              className="h-8 font-mono text-sm bg-background/50"
            />
            <datalist id={listId}>
              {COMMON_COMPLEXITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        ))}
      </div>
    </div>
  );
}
