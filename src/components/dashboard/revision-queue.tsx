import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { RefreshCw } from "lucide-react";
import type { RevisionQueueItem } from "@/types/prisma";

export function RevisionQueue({
  problems,
}: {
  problems: RevisionQueueItem[];
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
            Revision Queue
          </CardTitle>
          {problems.length > 0 && (
            <Link
              href="/problems?revision=true"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <RefreshCw className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              No problems need revision right now
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
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-500/10">
                    <RefreshCw className="h-3 w-3 text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium truncate group-hover:text-primary transition-colors block">
                      {item.problem.title}
                    </span>
                  </div>
                  <DifficultyBadge difficulty={item.problem.difficulty} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
