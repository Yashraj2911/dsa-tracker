export interface MemberSolution {
  solutionId: string;
  title: string;
  language: string;
  code: string;
  notes: string | null;
  solveTime: number | null;
  runtimeMs: number | null;
  runtimeBeatsPercent: number | null;
  memoryBeatsPercent: number | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  score: number;
  isBest: boolean;
  solvedAt: Date;
}

export interface MemberProblemEntry {
  userId: string;
  userName: string | null;
  userProblemId: string;
  isCurrentUser: boolean;
  /** All solutions for this member on this problem, best first */
  solutions: MemberSolution[];
  /** Highest score among solutions */
  score: number;
}

export interface GroupProblemEntry {
  problemId: string;
  title: string;
  difficulty: string;
  url: string;
  members: MemberProblemEntry[];
  participantCount: number;
  latestActivity: Date | null;
  winner: { userId: string; userName: string | null; score: number } | null;
  fastestSolver: {
    userId: string;
    userName: string | null;
    solveTime: number;
  } | null;
  mostOptimizedSolver: {
    userId: string;
    userName: string | null;
    runtimeBeats: number;
  } | null;
}
