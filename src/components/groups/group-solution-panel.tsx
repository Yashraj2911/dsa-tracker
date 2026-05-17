"use client";

import { formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";
import { MemberSolutionMetrics } from "./member-solution-metrics";
import { SolutionNotesDisplay } from "@/components/solutions/solution-notes-display";
import { SolutionCodeViewer } from "@/components/solutions/solution-code-viewer";
import { Badge } from "@/components/ui/badge";
import type { MemberSolution } from "@/types/group";

interface GroupSolutionPanelProps {
  solution: MemberSolution;
  difficulty: string;
  isWinner?: boolean;
  isFastestSolve?: boolean;
  isMostOptimized?: boolean;
  /** Mount Monaco when true — parent controls lazy loading */
  active: boolean;
}

export function GroupSolutionPanel({
  solution,
  difficulty,
  isWinner,
  isFastestSolve,
  isMostOptimized,
  active,
}: GroupSolutionPanelProps) {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-medium">{solution.title}</h4>
        {solution.isBest && (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]"
          >
            <Sparkles className="h-2.5 w-2.5" />
            Best score
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground/50">
          {formatDistanceToNow(new Date(solution.solvedAt), {
            addSuffix: true,
          })}
        </span>
      </div>

      <MemberSolutionMetrics
        solution={solution}
        difficulty={difficulty}
        isWinner={isWinner}
        isFastestSolve={isFastestSolve}
        isMostOptimized={isMostOptimized}
      />

      <SolutionNotesDisplay notes={solution.notes} />

      {active && (
        <SolutionCodeViewer
          code={solution.code}
          language={solution.language}
          height="280px"
        />
      )}
    </div>
  );
}
