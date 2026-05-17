"use client";

import {
  Trophy,
  Crown,
  Medal,
  Code2,
  Zap,
  Rocket,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { formatSolveTime } from "@/lib/scoring";
import type { GroupLeaderboardResult, LeaderboardEntry } from "@/lib/scoring";

interface GroupLeaderboardProps {
  leaderboard: GroupLeaderboardResult;
  currentUserId: string;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return <Crown className="h-4 w-4 text-amber-400" aria-label="1st" />;
  if (rank === 2)
    return <Medal className="h-4 w-4 text-slate-300" aria-label="2nd" />;
  if (rank === 3)
    return <Medal className="h-4 w-4 text-orange-500/80" aria-label="3rd" />;
  return (
    <span className="text-[11px] font-mono text-muted-foreground">{rank}</span>
  );
}

function LeaderboardHighlights({
  leaderboard,
}: {
  leaderboard: GroupLeaderboardResult;
}) {
  const { fastestSolver, mostOptimizedSolver, entries } = leaderboard;
  const topScorer = entries[0];

  if (!topScorer && !fastestSolver && !mostOptimizedSolver) return null;

  const cards = [
    topScorer && {
      icon: Crown,
      label: "Top scorer",
      name: topScorer.userName ?? "Unknown",
      detail: `${topScorer.totalScore.toLocaleString()} pts`,
      className: "border-amber-500/25 bg-amber-500/5 text-amber-300",
    },
    fastestSolver && {
      icon: Zap,
      label: "Fastest solver",
      name: fastestSolver.userName ?? "Unknown",
      detail: `${entries.find((e) => e.userId === fastestSolver.userId)?.fastestSolveWins ?? 0} fastest`,
      className: "border-blue-500/25 bg-blue-500/5 text-blue-300",
    },
    mostOptimizedSolver && {
      icon: Rocket,
      label: "Most optimized",
      name: mostOptimizedSolver.userName ?? "Unknown",
      detail: `${
        entries.find((e) => e.userId === mostOptimizedSolver.userId)
          ?.avgRuntimeBeats ?? "—"
      }% avg RT`,
      className: "border-violet-500/25 bg-violet-500/5 text-violet-300",
    },
  ].filter(Boolean) as Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    name: string;
    detail: string;
    className: string;
  }>;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-lg border px-3 py-2.5 flex items-center gap-2.5",
            card.className
          )}
        >
          <card.icon className="h-4 w-4 shrink-0 opacity-80" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              {card.label}
            </p>
            <p className="text-sm font-semibold truncate">{card.name}</p>
            <p className="text-[11px] opacity-80">{card.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PodiumCard({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const isFirst = entry.rank === 1;
  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col items-center gap-2 text-center transition-colors",
        isFirst
          ? "border-amber-500/30 bg-amber-500/5"
          : isCurrentUser
            ? "border-primary/30 bg-primary/5"
            : "border-border/50 bg-card"
      )}
    >
      <div className="mb-1">
        <RankIcon rank={entry.rank} />
      </div>
      <UserAvatar name={entry.userName} size="md" />
      <p
        className={cn(
          "text-sm font-semibold leading-none",
          isFirst && "text-amber-300",
          isCurrentUser && !isFirst && "text-primary"
        )}
      >
        {entry.userName ?? "Unknown"}
        {isCurrentUser && (
          <span className="ml-1 text-[10px] text-muted-foreground/60">
            (you)
          </span>
        )}
      </p>
      <p
        className={cn(
          "font-mono text-xl font-bold",
          isFirst ? "text-amber-400" : "text-foreground/80"
        )}
      >
        {entry.totalScore.toLocaleString()}
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          pts
        </span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-amber-400/60" />
          {entry.totalWins} win{entry.totalWins !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Code2 className="h-3 w-3 opacity-60" />
          {entry.problemsSolved} solved
        </span>
        {entry.avgSolveTimeMinutes != null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 opacity-60" />
            {formatSolveTime(entry.avgSolveTimeMinutes)} avg
          </span>
        )}
      </div>
    </div>
  );
}

export function GroupLeaderboard({
  leaderboard,
  currentUserId,
}: GroupLeaderboardProps) {
  const { entries } = leaderboard;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-16 text-center">
        <Trophy className="mb-3 h-8 w-8 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">Leaderboard is empty</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Submit solutions to earn points
        </p>
      </div>
    );
  }

  const podiumEntries = entries.slice(0, Math.min(3, entries.length));

  return (
    <div className="space-y-4">
      <LeaderboardHighlights leaderboard={leaderboard} />

      {entries.length >= 2 && (
        <div
          className={cn(
            "grid gap-3",
            podiumEntries.length === 2 ? "grid-cols-2" : "grid-cols-3"
          )}
        >
          {podiumEntries.map((entry) => (
            <PodiumCard
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="w-10 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                #
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Member
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Score
              </th>
              <th className="hidden md:table-cell px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Avg solve
              </th>
              <th className="hidden sm:table-cell px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Wins
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Fastest
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Avg RT%
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {entries.map((entry) => {
              const isFirst = entry.rank === 1;
              const isMe = entry.userId === currentUserId;

              return (
                <tr
                  key={entry.userId}
                  className={cn(
                    "transition-colors",
                    isFirst
                      ? "bg-amber-500/5 hover:bg-amber-500/8"
                      : isMe
                        ? "bg-primary/5 hover:bg-primary/8"
                        : "hover:bg-muted/20"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center w-5">
                      <RankIcon rank={entry.rank} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={entry.userName} />
                      <div>
                        <span
                          className={cn(
                            "font-medium text-sm",
                            isFirst && "text-amber-300",
                            isMe && !isFirst && "text-primary"
                          )}
                        >
                          {entry.userName ?? "Unknown"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {entry.isFastestSolver && (
                            <span className="text-[9px] text-blue-400">
                              ⚡ fastest
                            </span>
                          )}
                          {entry.isMostOptimized && (
                            <span className="text-[9px] text-violet-400">
                              🚀 optimized
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        isFirst ? "text-amber-400" : "text-foreground/80"
                      )}
                    >
                      {entry.totalScore.toLocaleString()}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-right text-sm text-muted-foreground">
                    {entry.avgSolveTimeMinutes != null
                      ? formatSolveTime(entry.avgSolveTimeMinutes)
                      : "—"}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-1">
                      {entry.totalWins > 0 && (
                        <Trophy className="h-3 w-3 text-amber-400" />
                      )}
                      <span
                        className={
                          entry.totalWins > 0
                            ? "text-amber-300 text-sm"
                            : "text-muted-foreground/40 text-sm"
                        }
                      >
                        {entry.totalWins}
                      </span>
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-right text-sm text-blue-300/80">
                    {entry.fastestSolveWins > 0 ? entry.fastestSolveWins : "—"}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-right text-sm text-violet-300/80">
                    {entry.avgRuntimeBeats != null
                      ? `${entry.avgRuntimeBeats}%`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
