import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getProblem } from "@/actions/problems";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { ProblemActions } from "@/components/problems/problem-actions";
import { SolutionTabs } from "@/components/solutions/solution-tabs";
import { ChevronRight, ExternalLink, Clock } from "lucide-react";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userProblem = await getProblem(id);

  if (!userProblem) notFound();

  const { problem, solutions } = userProblem;
  const totalSolveTime = solutions
    .map((s) => s.solveTime ?? 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-full px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/problems" className="hover:text-foreground transition-colors">
          Problems
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{problem.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">
              {problem.title}
            </h1>
            <DifficultyBadge
              difficulty={problem.difficulty}
              className="text-[12px] px-2 py-0.5"
            />
          </div>

          {/* Tags */}
          {problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {solutions.length} solution{solutions.length !== 1 ? "s" : ""}
            </span>
            {totalSolveTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {totalSolveTime}m total
              </span>
            )}
            <span>
              Added{" "}
              {formatDistanceToNow(new Date(userProblem.createdAt), {
                addSuffix: true,
              })}
            </span>
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              LeetCode
            </a>
          </div>
        </div>

        <ProblemActions
          userProblemId={userProblem.id}
          starred={userProblem.starred}
          needsRevision={userProblem.needsRevision}
        />
      </div>

      {/* Solutions */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Solutions</h2>
        <SolutionTabs
          solutions={solutions.map((s) => ({
            ...s,
            createdAt: new Date(s.createdAt),
          }))}
          userProblemId={userProblem.id}
        />
      </div>
    </div>
  );
}
