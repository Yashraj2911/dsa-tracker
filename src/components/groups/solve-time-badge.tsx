import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatSolveTime,
  isFastSolve,
  computeSolveTimeBonus,
} from "@/lib/scoring";

interface SolveTimeBadgeProps {
  solveTimeMinutes: number;
  difficulty: string;
  className?: string;
  compact?: boolean;
}

export function SolveTimeBadge({
  solveTimeMinutes,
  difficulty,
  className,
  compact,
}: SolveTimeBadgeProps) {
  const bonus = computeSolveTimeBonus(difficulty, solveTimeMinutes);
  const fast = isFastSolve(difficulty, bonus);
  const Icon = fast ? Zap : Clock;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        fast
          ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
          : "border-blue-500/20 bg-blue-500/10 text-blue-300",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-90" />
      {!compact && (
        <span className="text-muted-foreground/60">
          {fast ? "Solved in" : "Solved in"}
        </span>
      )}
      <span className="font-mono">{formatSolveTime(solveTimeMinutes)}</span>
    </span>
  );
}
