import type { GroupProblemEntry } from "@/types/group";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_BASE: Record<string, number> = {
  Easy: 100,
  Medium: 250,
  Hard: 500,
};

const OPTIMAL_COMPLEXITIES = new Set([
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
]);

/** Top-tier solve-time bonus per difficulty (for fast-solve badge) */
const TOP_SOLVE_TIME_BONUS: Record<string, number> = {
  Easy: 100,
  Medium: 150,
  Hard: 250,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SolutionScoreInputs {
  solveTime?: number | null;
  runtimeBeatsPercent?: number | null;
  memoryBeatsPercent?: number | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
}

export interface SolutionScoreBreakdown {
  base: number;
  runtimeBonus: number;
  memoryBonus: number;
  timeComplexityBonus: number;
  spaceComplexityBonus: number;
  solveTimeBonus: number;
  total: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  totalScore: number;
  totalWins: number;
  problemsSolved: number;
  /** Average solve time (minutes) across best solutions that have solveTime */
  avgSolveTimeMinutes: number | null;
  /** Problems where this member had the fastest solve among participants */
  fastestSolveWins: number;
  /** Average runtime beats % on best solutions (where recorded) */
  avgRuntimeBeats: number | null;
  isFastestSolver: boolean;
  isMostOptimized: boolean;
}

export interface GroupLeaderboardResult {
  entries: LeaderboardEntry[];
  /** Member with the most fastest-solve wins */
  fastestSolver: { userId: string; userName: string | null } | null;
  /** Member with highest avg runtime beats */
  mostOptimizedSolver: { userId: string; userName: string | null } | null;
}

// ─── Solve time formatting ────────────────────────────────────────────────────

/** Format minutes as human-readable duration: "12 min", "1h 24m" */
export function formatSolveTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Display label for solve time badges */
export function formatSolveTimeLabel(
  minutes: number,
  options?: { fast?: boolean }
): string {
  const prefix = options?.fast ? "Solved in" : "Solved in";
  return `${prefix} ${formatSolveTime(minutes)}`;
}

// ─── Solve time bonus ─────────────────────────────────────────────────────────

/**
 * Tiered solve-speed bonus by difficulty (minutes).
 * No penalty for slow solves — only positive bonuses.
 */
export function computeSolveTimeBonus(
  difficulty: string,
  solveTimeMinutes: number | null | undefined
): number {
  if (solveTimeMinutes == null || solveTimeMinutes < 0) return 0;
  const m = solveTimeMinutes;

  switch (difficulty) {
    case "Easy":
      if (m < 5) return 100;
      if (m < 15) return 50;
      return 0;
    case "Medium":
      if (m < 15) return 150;
      if (m < 30) return 80;
      return 0;
    case "Hard":
      if (m < 30) return 250;
      if (m < 60) return 120;
      return 0;
    default:
      if (m < 5) return 100;
      if (m < 15) return 50;
      return 0;
  }
}

export function isFastSolve(
  difficulty: string,
  solveTimeBonus: number
): boolean {
  const top = TOP_SOLVE_TIME_BONUS[difficulty] ?? TOP_SOLVE_TIME_BONUS.Easy;
  return solveTimeBonus >= top && solveTimeBonus > 0;
}

// ─── Full score calculation ───────────────────────────────────────────────────

export function computeSolutionScoreBreakdown(
  difficulty: string,
  metrics: SolutionScoreInputs
): SolutionScoreBreakdown {
  const base = DIFFICULTY_BASE[difficulty] ?? 100;

  const runtimeBonus =
    metrics.runtimeBeatsPercent != null
      ? Math.floor((metrics.runtimeBeatsPercent / 100) * 200)
      : 0;

  const memoryBonus =
    metrics.memoryBeatsPercent != null
      ? Math.floor((metrics.memoryBeatsPercent / 100) * 100)
      : 0;

  const timeComplexityBonus = OPTIMAL_COMPLEXITIES.has(
    metrics.timeComplexity?.trim() ?? ""
  )
    ? 25
    : 0;

  const spaceComplexityBonus = OPTIMAL_COMPLEXITIES.has(
    metrics.spaceComplexity?.trim() ?? ""
  )
    ? 25
    : 0;

  const solveTimeBonus = computeSolveTimeBonus(difficulty, metrics.solveTime);

  const total =
    base +
    runtimeBonus +
    memoryBonus +
    timeComplexityBonus +
    spaceComplexityBonus +
    solveTimeBonus;

  return {
    base,
    runtimeBonus,
    memoryBonus,
    timeComplexityBonus,
    spaceComplexityBonus,
    solveTimeBonus,
    total,
  };
}

/** Total score from difficulty + solution metrics (server-side source of truth). */
export function computeSolutionScore(
  difficulty: string,
  metrics: SolutionScoreInputs
): number {
  return computeSolutionScoreBreakdown(difficulty, metrics).total;
}

// ─── Problem-level highlights ─────────────────────────────────────────────────

export function getProblemHighlights(members: GroupProblemEntry["members"]) {
  let fastest: {
    userId: string;
    userName: string | null;
    solveTime: number;
  } | null = null;

  let mostOptimized: {
    userId: string;
    userName: string | null;
    runtimeBeats: number;
  } | null = null;

  for (const member of members) {
    const best =
      member.solutions.find((s) => s.isBest) ?? member.solutions[0];
    if (!best) continue;

    if (best.solveTime != null) {
      if (!fastest || best.solveTime < fastest.solveTime) {
        fastest = {
          userId: member.userId,
          userName: member.userName,
          solveTime: best.solveTime,
        };
      }
    }

    if (best.runtimeBeatsPercent != null) {
      if (
        !mostOptimized ||
        best.runtimeBeatsPercent > mostOptimized.runtimeBeats
      ) {
        mostOptimized = {
          userId: member.userId,
          userName: member.userName,
          runtimeBeats: best.runtimeBeatsPercent,
        };
      }
    }
  }

  return { fastest, mostOptimized };
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function computeLeaderboard(
  problems: GroupProblemEntry[],
  members: Array<{ userId: string; userName: string | null }>
): GroupLeaderboardResult {
  type Acc = {
    totalScore: number;
    wins: number;
    solved: number;
    solveTimes: number[];
    fastestSolveWins: number;
    runtimeBeats: number[];
  };

  const stats = new Map<string, Acc>(
    members.map((m) => [
      m.userId,
      {
        totalScore: 0,
        wins: 0,
        solved: 0,
        solveTimes: [],
        fastestSolveWins: 0,
        runtimeBeats: [],
      },
    ])
  );

  for (const problem of problems) {
    for (const member of problem.members) {
      const s = stats.get(member.userId);
      if (!s) continue;
      s.totalScore += member.score;
      if (member.score > 0) s.solved += 1;

      const best =
        member.solutions.find((sol) => sol.isBest) ?? member.solutions[0];
      if (best?.solveTime != null) s.solveTimes.push(best.solveTime);
      if (best?.runtimeBeatsPercent != null) {
        s.runtimeBeats.push(best.runtimeBeatsPercent);
      }
    }

    if (problem.winner && problem.winner.score > 0) {
      const s = stats.get(problem.winner.userId);
      if (s) s.wins += 1;
    }

    const { fastest } = getProblemHighlights(problem.members);
    if (fastest) {
      const s = stats.get(fastest.userId);
      if (s) s.fastestSolveWins += 1;
    }
  }

  const nameMap = new Map(members.map((m) => [m.userId, m.userName]));

  const entries: LeaderboardEntry[] = [...stats.entries()]
    .map(([userId, s]) => ({
      rank: 0,
      userId,
      userName: nameMap.get(userId) ?? null,
      totalScore: s.totalScore,
      totalWins: s.wins,
      problemsSolved: s.solved,
      avgSolveTimeMinutes:
        s.solveTimes.length > 0
          ? Math.round(
              s.solveTimes.reduce((a, b) => a + b, 0) / s.solveTimes.length
            )
          : null,
      fastestSolveWins: s.fastestSolveWins,
      avgRuntimeBeats:
        s.runtimeBeats.length > 0
          ? Math.round(
              (s.runtimeBeats.reduce((a, b) => a + b, 0) /
                s.runtimeBeats.length) *
                10
            ) / 10
          : null,
      isFastestSolver: false,
      isMostOptimized: false,
    }))
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.problemsSolved - a.problemsSolved ||
        b.totalWins - a.totalWins
    )
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const maxFastestWins = Math.max(
    0,
    ...entries.map((e) => e.fastestSolveWins)
  );
  const maxAvgBeats = Math.max(
    0,
    ...entries.map((e) => e.avgRuntimeBeats ?? 0)
  );

  for (const entry of entries) {
    entry.isFastestSolver =
      maxFastestWins > 0 && entry.fastestSolveWins === maxFastestWins;
    entry.isMostOptimized =
      maxAvgBeats > 0 && (entry.avgRuntimeBeats ?? 0) === maxAvgBeats;
  }

  const fastestSolver =
    entries.find((e) => e.isFastestSolver) ?? null;
  const mostOptimizedSolver =
    entries.find((e) => e.isMostOptimized) ?? null;

  return {
    entries,
    fastestSolver: fastestSolver
      ? {
          userId: fastestSolver.userId,
          userName: fastestSolver.userName,
        }
      : null,
    mostOptimizedSolver: mostOptimizedSolver
      ? {
          userId: mostOptimizedSolver.userId,
          userName: mostOptimizedSolver.userName,
        }
      : null,
  };
}
