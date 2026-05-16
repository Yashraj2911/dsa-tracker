import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { Code2, ExternalLink } from "lucide-react";
import type { UserProblemWithProblem } from "@/types/prisma";

export function RecentProblems({
  problems,
}: {
  problems: UserProblemWithProblem[];
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
            Recent Problems
          </CardTitle>
          <Link
            href="/problems"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Code2 className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No problems yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add your first LeetCode problem to get started
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {problems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/problems/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {item.problem.title}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <DifficultyBadge difficulty={item.problem.difficulty} />
                      {item.solutions[0] && (
                        <span className="text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
                          {item.solutions[0].language}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground/60">
                    {formatDistanceToNow(new Date(item.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
