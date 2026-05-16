import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code2, TrendingUp, Star, RefreshCw } from "lucide-react";
import type { DashboardStats } from "@/actions/problems";

export function StatsCards({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Problems",
      value: stats.total,
      icon: Code2,
      sub: `${stats.easy}E · ${stats.medium}M · ${stats.hard}H`,
      accent: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Easy",
      value: stats.easy,
      icon: TrendingUp,
      sub:
        stats.total > 0
          ? `${Math.round((stats.easy / stats.total) * 100)}% of total`
          : "—",
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Medium",
      value: stats.medium,
      icon: TrendingUp,
      sub:
        stats.total > 0
          ? `${Math.round((stats.medium / stats.total) * 100)}% of total`
          : "—",
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Hard",
      value: stats.hard,
      icon: TrendingUp,
      sub:
        stats.total > 0
          ? `${Math.round((stats.hard / stats.total) * 100)}% of total`
          : "—",
      accent: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      title: "Needs Revision",
      value: stats.revisionCount,
      icon: RefreshCw,
      sub: "problems to revisit",
      accent: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      title: "Starred",
      value: stats.starredCount,
      icon: Star,
      sub: "favourite problems",
      accent: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="hover:ring-foreground/15 transition-all duration-200"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${card.bg}`}>
                <card.icon className={`h-3 w-3 ${card.accent}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
