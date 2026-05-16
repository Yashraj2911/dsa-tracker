import { cn } from "@/lib/utils";

const difficultyConfig = {
  Easy: {
    label: "Easy",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Hard: {
    label: "Hard",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const config =
    difficultyConfig[difficulty as keyof typeof difficultyConfig] ??
    difficultyConfig.Medium;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
