import { Suspense } from "react";
import {
  getDashboardStats,
  getRecentProblems,
  getRevisionQueue,
} from "@/actions/problems";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentProblems } from "@/components/dashboard/recent-problems";
import { RevisionQueue } from "@/components/dashboard/revision-queue";
import { DifficultyChart } from "@/components/dashboard/difficulty-chart";
import { AddProblemDialog } from "@/components/problems/add-problem-dialog";
import { Skeleton } from "@/components/ui/skeleton";

async function DashboardContent() {
  const [stats, recentProblems, revisionQueue] = await Promise.all([
    getDashboardStats(),
    getRecentProblems(8),
    getRevisionQueue(6),
  ]);

  return (
    <>
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentProblems problems={recentProblems} />
        </div>
        <div className="space-y-6">
          <RevisionQueue problems={revisionQueue} />
          <DifficultyChart stats={stats} />
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-full px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your DSA progress at a glance
          </p>
        </div>
        <AddProblemDialog />
      </div>

      <div className="space-y-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
