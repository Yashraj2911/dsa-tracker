import { Zap, Rocket, Brain, Clock, Timer, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

export type SolutionMetricsDisplay = {
  solveTime?: number | null;
  runtimeMs?: number | null;
  runtimeBeatsPercent?: number | null;
  memoryBeatsPercent?: number | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
};

function MetricBadge({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm transition-colors",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-80" />
      {label ? (
        <span className="text-muted-foreground/70">{label}</span>
      ) : null}
      <span className="font-mono text-foreground">{value}</span>
    </span>
  );
}

function formatPercent(n: number): string {
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

export function PerformanceMetricsBadges({
  metrics,
  className,
}: {
  metrics: SolutionMetricsDisplay;
  className?: string;
}) {
  const runtimeBadges: React.ReactNode[] = [];
  const complexityBadges: React.ReactNode[] = [];

  if (metrics.solveTime !== null && metrics.solveTime !== undefined) {
    runtimeBadges.push(
      <MetricBadge
        key="time"
        icon={Clock}
        label=""
        value={`${metrics.solveTime}m`}
        className="border-blue-500/20 bg-blue-500/10 text-blue-300"
      />
    );
  }

  if (metrics.runtimeMs !== null && metrics.runtimeMs !== undefined) {
    runtimeBadges.push(
      <MetricBadge
        key="runtime"
        icon={Zap}
        label=""
        value={`${metrics.runtimeMs} ms`}
        className="border-amber-500/20 bg-amber-500/10 text-amber-300"
      />
    );
  }

  if (
    metrics.runtimeBeatsPercent !== null &&
    metrics.runtimeBeatsPercent !== undefined
  ) {
    runtimeBadges.push(
      <MetricBadge
        key="runtime-beats"
        icon={Rocket}
        label="Beats"
        value={`${formatPercent(metrics.runtimeBeatsPercent)} runtime`}
        className="border-violet-500/20 bg-violet-500/10 text-violet-300"
      />
    );
  }

  if (
    metrics.memoryBeatsPercent !== null &&
    metrics.memoryBeatsPercent !== undefined
  ) {
    runtimeBadges.push(
      <MetricBadge
        key="memory-beats"
        icon={Brain}
        label="Beats"
        value={`${formatPercent(metrics.memoryBeatsPercent)} memory`}
        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      />
    );
  }

  if (metrics.timeComplexity) {
    complexityBadges.push(
      <MetricBadge
        key="time-complexity"
        icon={Timer}
        label="Time"
        value={metrics.timeComplexity}
        className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
      />
    );
  }

  if (metrics.spaceComplexity) {
    complexityBadges.push(
      <MetricBadge
        key="space-complexity"
        icon={HardDrive}
        label="Space"
        value={metrics.spaceComplexity}
        className="border-sky-500/20 bg-sky-500/10 text-sky-300"
      />
    );
  }

  if (runtimeBadges.length === 0 && complexityBadges.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {runtimeBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">{runtimeBadges}</div>
      )}
      {complexityBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">{complexityBadges}</div>
      )}
    </div>
  );
}
