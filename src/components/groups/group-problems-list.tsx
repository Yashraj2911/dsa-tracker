"use client";

import { Code2 } from "lucide-react";
import { GroupProblemCard } from "./group-problem-card";
import type { GroupProblemEntry } from "@/types/group";

interface GroupProblemsListProps {
  problems: GroupProblemEntry[];
}

export function GroupProblemsList({ problems }: GroupProblemsListProps) {
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-16 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Code2 className="h-4 w-4 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">No problems solved yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Problems appear here once members submit solutions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {problems.map((entry) => (
        <GroupProblemCard key={entry.problemId} entry={entry} />
      ))}
    </div>
  );
}
