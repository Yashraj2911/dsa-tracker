import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getProblems } from "@/actions/problems";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { ProblemFilters } from "@/components/problems/problem-filters";
import { ProblemRowActions } from "@/components/problems/problem-row-actions";
import { AddProblemDialog } from "@/components/problems/add-problem-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Code2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";

interface SearchParams {
  search?: string;
  difficulty?: string;
  language?: string;
  starred?: string;
  revision?: string;
}

async function ProblemsTable({ searchParams }: { searchParams: SearchParams }) {
  const problems = await getProblems({
    search: searchParams.search,
    difficulty: searchParams.difficulty,
    language: searchParams.language,
    starred: searchParams.starred === "true" ? true : undefined,
    needsRevision: searchParams.revision === "true" ? true : undefined,
  });

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Code2 className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No problems found
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Try adjusting your filters or add a new problem
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
            <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
              Tags
            </th>
            <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
              Language
            </th>
            <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">
              Last Updated
            </th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {problems.map((item) => {
            const latestLang = item.solutions[0]?.language;
            const langLabel = SUPPORTED_LANGUAGES.find(
              (l) => l.value === latestLang
            )?.label;

            return (
              <tr
                key={item.id}
                className="group hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/problems/${item.id}`}
                    className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
                  >
                    {item.problem.title}
                    {item.starred && (
                      <span className="text-yellow-400 text-[10px]">★</span>
                    )}
                    {item.needsRevision && (
                      <span className="rounded bg-orange-500/10 px-1 py-0.5 text-[10px] text-orange-400">
                        revision
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <DifficultyBadge difficulty={item.problem.difficulty} />
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {item.problem.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.problem.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground/50">
                        +{item.problem.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  {langLabel ? (
                    <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                      {langLabel}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30 text-xs">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ProblemRowActions
                      userProblemId={item.id}
                      starred={item.starred}
                      needsRevision={item.needsRevision}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProblemsTableSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-4 w-16 hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const title = params.starred === "true"
    ? "Starred Problems"
    : params.revision === "true"
    ? "Revision Queue"
    : "All Problems";

  return (
    <div className="min-h-full px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your saved LeetCode problems
          </p>
        </div>
        <AddProblemDialog />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <Suspense fallback={null}>
          <ProblemFilters />
        </Suspense>
      </div>

      {/* Table */}
      <Suspense fallback={<ProblemsTableSkeleton />}>
        <ProblemsTable searchParams={params} />
      </Suspense>
    </div>
  );
}
