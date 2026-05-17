import {
  Zap,
  Brain,
  Timer,
  HardDrive,
  Trophy,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SolveTimeBadge } from "./solve-time-badge";
import { isFastSolve, computeSolveTimeBonus } from "@/lib/scoring";
import type { MemberSolution } from "@/types/group";

interface MemberSolutionMetricsProps {
  solution: MemberSolution;
  difficulty: string;
  isWinner?: boolean;
  isFastestSolve?: boolean;
  isMostOptimized?: boolean;
  className?: string;
}

function MetricPill({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-80" />
      {label && (
        <span className="text-muted-foreground/60">{label}</span>
      )}
      <span className="font-mono">{value}</span>
    </span>
  );
}

function HighlightBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function MemberSolutionMetrics({
  solution,
  difficulty,
  isWinner,
  isFastestSolve,
  isMostOptimized,
  className,
}: MemberSolutionMetricsProps) {
  const runtimePct =
    solution.runtimeBeatsPercent != null
      ? `${solution.runtimeBeatsPercent.toFixed(1)}%`
      : null;
  const memoryPct =
    solution.memoryBeatsPercent != null
      ? `${solution.memoryBeatsPercent.toFixed(1)}%`
      : null;

  const solveBonus = computeSolveTimeBonus(difficulty, solution.solveTime);
  const fastSolve = isFastSolve(difficulty, solveBonus);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        <MetricPill
          icon={Trophy}
          value={`${solution.score.toLocaleString()} pts`}
          className={cn(
            isWinner
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-border/50 bg-muted/30 text-foreground/80"
          )}
        />
        {solution.solveTime != null && (
          <SolveTimeBadge
            solveTimeMinutes={solution.solveTime}
            difficulty={difficulty}
          />
        )}
        {solution.runtimeMs != null && (
          <MetricPill
            icon={Zap}
            value={`${solution.runtimeMs}ms`}
            className="border-amber-500/20 bg-amber-500/10 text-amber-300"
          />
        )}
        {runtimePct && (
          <MetricPill
            icon={Rocket}
            label="RT"
            value={runtimePct}
            className="border-violet-500/20 bg-violet-500/10 text-violet-300"
          />
        )}
        {memoryPct && (
          <MetricPill
            icon={Brain}
            label="Mem"
            value={memoryPct}
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          />
        )}
        {solution.timeComplexity && (
          <MetricPill
            icon={Timer}
            label="Time"
            value={solution.timeComplexity}
            className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
          />
        )}
        {solution.spaceComplexity && (
          <MetricPill
            icon={HardDrive}
            label="Space"
            value={solution.spaceComplexity}
            className="border-sky-500/20 bg-sky-500/10 text-sky-300"
          />
        )}
      </div>

      {(isFastestSolve || isMostOptimized || fastSolve) && (
        <div className="flex flex-wrap gap-1.5">
          {fastSolve && (
            <HighlightBadge className="border-blue-400/30 bg-blue-500/10 text-blue-300">
              <Zap className="h-2.5 w-2.5" />
              Fast solve
            </HighlightBadge>
          )}
          {isFastestSolve && (
            <HighlightBadge className="border-blue-500/30 bg-blue-500/10 text-blue-300">
              <Zap className="h-2.5 w-2.5" />
              Fastest
            </HighlightBadge>
          )}
          {isMostOptimized && (
            <HighlightBadge className="border-violet-500/30 bg-violet-500/10 text-violet-300">
              <Rocket className="h-2.5 w-2.5" />
              Most optimized
            </HighlightBadge>
          )}
        </div>
      )}
    </div>
  );
}
