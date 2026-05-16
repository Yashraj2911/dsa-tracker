import { formatDistanceToNow } from "date-fns";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { Code2, RefreshCw, Star } from "lucide-react";
import Link from "next/link";

type SharedProblem = {
  id: string;
  needsRevision: boolean;
  starred: boolean;
  updatedAt: Date;
  user: { id: string; name: string | null };
  problem: {
    title: string;
    difficulty: string;
    tags: string[];
    url: string;
  };
  solutions: { language: string; createdAt: Date }[];
};

interface SharedProblemsTableProps {
  problems: SharedProblem[];
  currentUserId: string;
}

function MemberChip({ name }: { name: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary font-medium">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold">
        {initials}
      </span>
      {name ?? "Unknown"}
    </span>
  );
}

export function SharedProblemsTable({
  problems,
  currentUserId,
}: SharedProblemsTableProps) {
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-16 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Code2 className="h-4 w-4 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">No problems solved yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Problems appear here when members start solving
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Problem
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Difficulty
            </th>
            <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
              Solved By
            </th>
            <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
              Language
            </th>
            <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {problems.map((item) => {
            const isOwn = item.user.id === currentUserId;
            const latestSolution = item.solutions[0];

            return (
              <tr
                key={item.id}
                className="group hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isOwn ? (
                      <Link
                        href={`/problems/${item.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.problem.title}
                      </Link>
                    ) : (
                      <a
                        href={item.problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.problem.title}
                      </a>
                    )}
                    {item.starred && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    )}
                    {item.needsRevision && (
                      <RefreshCw className="h-3 w-3 text-orange-400 shrink-0" />
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <DifficultyBadge difficulty={item.problem.difficulty} />
                </td>

                <td className="hidden px-4 py-3 sm:table-cell">
                  <MemberChip name={item.user.name} />
                </td>

                <td className="hidden px-4 py-3 md:table-cell">
                  {latestSolution ? (
                    <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                      {latestSolution.language}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30 text-xs">—</span>
                  )}
                </td>

                <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
