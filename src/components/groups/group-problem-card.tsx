"use client";

import { useState } from "react";
import { ChevronDown, Trophy, Users, Clock, Zap, Rocket } from "lucide-react";
import { formatSolveTime } from "@/lib/scoring";
import { formatDistanceToNow } from "date-fns";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { MemberProblemEntryCard } from "./member-problem-entry";
import { cn } from "@/lib/utils";
import type { GroupProblemEntry } from "@/types/group";

interface GroupProblemCardProps {
  entry: GroupProblemEntry;
}

export function GroupProblemCard({ entry }: GroupProblemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const latestTime = entry.latestActivity
    ? formatDistanceToNow(new Date(entry.latestActivity), { addSuffix: true })
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200",
        expanded && "border-border/70 shadow-sm shadow-black/20"
      )}
    >
      <button
        type="button"
        className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-muted/20 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="mt-0.5 shrink-0">
          <DifficultyBadge difficulty={entry.difficulty} />
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm leading-snug block truncate">
            {entry.title}
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {entry.participantCount}{" "}
              {entry.participantCount === 1 ? "member" : "members"}
            </span>
            {latestTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {latestTime}
              </span>
            )}
            {entry.winner && (
              <span className="flex items-center gap-1 font-medium text-amber-400/90">
                <Trophy className="h-3 w-3" />
                {entry.winner.userName ?? "Unknown"} &middot;{" "}
                {entry.winner.score.toLocaleString()} pts
              </span>
            )}
            {entry.fastestSolver && (
              <span className="flex items-center gap-1 text-blue-300/90">
                <Zap className="h-3 w-3" />
                {entry.fastestSolver.userName ?? "Unknown"} &middot;{" "}
                {formatSolveTime(entry.fastestSolver.solveTime)}
              </span>
            )}
            {entry.mostOptimizedSolver && (
              <span className="flex items-center gap-1 text-violet-300/80">
                <Rocket className="h-3 w-3" />
                {entry.mostOptimizedSolver.userName ?? "Unknown"} &middot;{" "}
                {entry.mostOptimizedSolver.runtimeBeats.toFixed(0)}% RT
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 mt-0.5",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-border/40 bg-muted/5 px-3 py-3 space-y-2">
          {entry.members.map((member, idx) => (
            <MemberProblemEntryCard
              key={member.userId}
              member={member}
              rank={idx + 1}
              isWinner={entry.winner?.userId === member.userId}
              difficulty={entry.difficulty}
              fastestSolverUserId={entry.fastestSolver?.userId ?? null}
              mostOptimizedSolverUserId={
                entry.mostOptimizedSolver?.userId ?? null
              }
              problemExpanded={expanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
