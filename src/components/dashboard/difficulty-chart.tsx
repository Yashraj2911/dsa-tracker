import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Stats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

function Bar({
  label,
  value,
  total,
  color,
  bg,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  bg: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${color}`}>{label}</span>
        <span className="text-muted-foreground">
          {value}{" "}
          <span className="text-muted-foreground/50">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${bg} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DifficultyChart({ stats }: { stats: Stats | null }) {
  if (!stats || stats.total === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          Difficulty Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Bar
          label="Easy"
          value={stats.easy}
          total={stats.total}
          color="text-emerald-400"
          bg="bg-emerald-500"
        />
        <Bar
          label="Medium"
          value={stats.medium}
          total={stats.total}
          color="text-amber-400"
          bg="bg-amber-500"
        />
        <Bar
          label="Hard"
          value={stats.hard}
          total={stats.total}
          color="text-red-400"
          bg="bg-red-500"
        />
        <div className="border-t border-border/50 pt-3 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{stats.total}</span>{" "}
            problems total
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
