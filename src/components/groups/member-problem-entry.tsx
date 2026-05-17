"use client";

import { useState } from "react";
import { ChevronDown, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "./user-avatar";
import { GroupSolutionPanel } from "./group-solution-panel";
import { MemberSolutionMetrics } from "./member-solution-metrics";
import { cn } from "@/lib/utils";
import type { MemberProblemEntry } from "@/types/group";

interface MemberProblemEntryCardProps {
  member: MemberProblemEntry;
  rank: number;
  isWinner: boolean;
  difficulty: string;
  fastestSolverUserId: string | null;
  mostOptimizedSolverUserId: string | null;
  /** Parent problem card is expanded — enables lazy Monaco */
  problemExpanded: boolean;
}

export function MemberProblemEntryCard({
  member,
  rank,
  isWinner,
  difficulty,
  fastestSolverUserId,
  mostOptimizedSolverUserId,
  problemExpanded,
}: MemberProblemEntryCardProps) {
  const isFastestSolve = fastestSolverUserId === member.userId;
  const isMostOptimized = mostOptimizedSolverUserId === member.userId;
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(
    member.solutions[0]?.solutionId ?? ""
  );

  const activeSolution =
    member.solutions.find((s) => s.solutionId === activeTab) ??
    member.solutions[0];

  const showMonaco = problemExpanded && expanded;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-card/50 overflow-hidden transition-colors",
        isWinner && "border-amber-500/20",
        member.isCurrentUser && !isWinner && "border-primary/20"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors",
          expanded ? "bg-muted/15" : "hover:bg-muted/20",
          isWinner && "bg-amber-500/5"
        )}
        aria-expanded={expanded}
      >
        <span className="flex w-5 shrink-0 items-center justify-center">
          {isWinner ? (
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <span className="text-[11px] font-mono text-muted-foreground">
              {rank}
            </span>
          )}
        </span>

        <UserAvatar name={member.userName} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium truncate",
                member.isCurrentUser && "text-primary"
              )}
            >
              {member.userName ?? "Unknown"}
            </span>
            {member.isCurrentUser && (
              <span className="text-[10px] text-primary/50">you</span>
            )}
            {isWinner && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                Winner
              </span>
            )}
          </div>
          {!expanded && activeSolution && (
            <div className="mt-2">
              <MemberSolutionMetrics
                solution={activeSolution}
                difficulty={difficulty}
                isWinner={isWinner}
                isFastestSolve={isFastestSolve}
                isMostOptimized={isMostOptimized}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              isWinner ? "text-amber-400" : "text-foreground/70"
            )}
          >
            {member.score.toLocaleString()}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {expanded && member.solutions.length > 0 && (
        <div className="border-t border-border/30 px-3 pb-3">
          {member.solutions.length > 1 ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-2"
            >
              <TabsList
                variant="line"
                className="mb-3 h-auto flex-wrap gap-0 bg-transparent p-0"
              >
                {member.solutions.map((sol, i) => (
                  <TabsTrigger
                    key={sol.solutionId}
                    value={sol.solutionId}
                    className="gap-1.5 text-xs data-[state=active]:text-foreground"
                  >
                    {sol.title || `Solution ${i + 1}`}
                    {sol.isBest && (
                      <span className="text-[9px] text-amber-400">★</span>
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {sol.score}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {member.solutions.map((sol) => (
                <TabsContent
                  key={sol.solutionId}
                  value={sol.solutionId}
                  className="mt-0 focus-visible:outline-none"
                >
                  <GroupSolutionPanel
                    solution={sol}
                    difficulty={difficulty}
                    isWinner={isWinner && sol.isBest}
                    isFastestSolve={isFastestSolve && sol.isBest}
                    isMostOptimized={isMostOptimized && sol.isBest}
                    active={showMonaco && activeTab === sol.solutionId}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <GroupSolutionPanel
              solution={member.solutions[0]}
              difficulty={difficulty}
              isWinner={isWinner}
              isFastestSolve={isFastestSolve}
              isMostOptimized={isMostOptimized}
              active={showMonaco}
            />
          )}
        </div>
      )}
    </div>
  );
}
