import type { Prisma } from "@prisma/client";

// ─── Group queries ────────────────────────────────────────────────────────────

export const groupWithMembersInclude = {
  owner: { select: { id: true, name: true, email: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ role: "asc" as const }, { joinedAt: "asc" as const }],
  },
} satisfies Prisma.GroupInclude;

export type GroupWithMembersPayload = Prisma.GroupGetPayload<{
  include: typeof groupWithMembersInclude;
}>;

export type GroupMemberWithUser = GroupWithMembersPayload["members"][number];

export type GroupMemberWithStats = GroupMemberWithUser & {
  problemCount: number;
  revisionCount: number;
};

export type GroupWithMembersResult = Omit<
  GroupWithMembersPayload,
  "members"
> & {
  members: GroupMemberWithStats[];
  currentUserRole: string;
  isOwner: boolean;
  currentUserId: string;
};

export const myGroupMembershipInclude = {
  group: {
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true } },
    },
  },
} satisfies Prisma.GroupMemberInclude;

export type MyGroupMembership = Prisma.GroupMemberGetPayload<{
  include: typeof myGroupMembershipInclude;
}>;

export const groupByInviteCodeInclude = {
  _count: { select: { members: true } },
} satisfies Prisma.GroupInclude;

export type GroupByInviteCode = Prisma.GroupGetPayload<{
  include: typeof groupByInviteCodeInclude;
}>;

// ─── Group member ID lookups ──────────────────────────────────────────────────

export type GroupMemberUserId = Prisma.GroupMemberGetPayload<{
  select: { userId: true };
}>;

// ─── GroupBy aggregates ───────────────────────────────────────────────────────

export type UserProblemCountByUser = {
  userId: string;
  _count: { id: number };
};

// ─── Shared problems & activity ───────────────────────────────────────────────

export const groupSharedProblemInclude = {
  problem: true,
  user: { select: { id: true, name: true } },
  solutions: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { language: true, createdAt: true },
  },
} satisfies Prisma.UserProblemInclude;

export type GroupSharedProblem = Prisma.UserProblemGetPayload<{
  include: typeof groupSharedProblemInclude;
}>;

export const groupActivityInclude = {
  user: { select: { id: true, name: true } },
  userProblem: {
    include: {
      problem: { select: { id: true, title: true, difficulty: true } },
    },
  },
} satisfies Prisma.SolutionInclude;

export type GroupActivityItem = Prisma.SolutionGetPayload<{
  include: typeof groupActivityInclude;
}>;

export const memberProfileInclude = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.GroupMemberInclude;

export const memberRecentSolutionInclude = {
  userProblem: {
    include: {
      problem: { select: { title: true, difficulty: true } },
    },
  },
} satisfies Prisma.SolutionInclude;

export type MemberProfileMembership = Prisma.GroupMemberGetPayload<{
  include: typeof memberProfileInclude;
}>;

export type MemberRecentSolution = Prisma.SolutionGetPayload<{
  include: typeof memberRecentSolutionInclude;
}>;

export type MemberProfileResult = {
  member: MemberProfileMembership;
  problemCount: number;
  revisionCount: number;
  recentSolutions: MemberRecentSolution[];
};

// ─── Group problem-centric query (aggregated by unique problem) ───────────────

export const groupMemberSolutionInclude = {
  solutions: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      title: true,
      language: true,
      code: true,
      notes: true,
      solveTime: true,
      runtimeMs: true,
      runtimeBeatsPercent: true,
      memoryBeatsPercent: true,
      timeComplexity: true,
      spaceComplexity: true,
      createdAt: true,
    },
  },
  user: { select: { id: true, name: true } },
  problem: {
    select: { id: true, title: true, difficulty: true, url: true },
  },
} satisfies Prisma.UserProblemInclude;

export type GroupMemberProblemRow = Prisma.UserProblemGetPayload<{
  include: typeof groupMemberSolutionInclude;
}>;

// ─── Problem queries ──────────────────────────────────────────────────────────

export const userProblemWithProblemInclude = {
  problem: true,
  solutions: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
} satisfies Prisma.UserProblemInclude;

export type UserProblemWithProblem = Prisma.UserProblemGetPayload<{
  include: typeof userProblemWithProblemInclude;
}>;

export const userProblemDetailInclude = {
  problem: true,
  solutions: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.UserProblemInclude;

export type UserProblemDetail = Prisma.UserProblemGetPayload<{
  include: typeof userProblemDetailInclude;
}>;

export const revisionQueueInclude = {
  problem: true,
} satisfies Prisma.UserProblemInclude;

export type RevisionQueueItem = Prisma.UserProblemGetPayload<{
  include: typeof revisionQueueInclude;
}>;
