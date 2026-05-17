"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { syncUser } from "./users";
import type { CreateGroupInput } from "@/lib/validations";
import type { Group, GroupMember } from "@prisma/client";
import {
  groupWithMembersInclude,
  myGroupMembershipInclude,
  groupByInviteCodeInclude,
  groupSharedProblemInclude,
  groupActivityInclude,
  memberProfileInclude,
  memberRecentSolutionInclude,
  groupMemberSolutionInclude,
  type GroupWithMembersPayload,
  type GroupMemberWithUser,
  type GroupMemberWithStats,
  type GroupWithMembersResult,
  type MyGroupMembership,
  type GroupByInviteCode,
  type GroupMemberUserId,
  type UserProblemCountByUser,
  type GroupSharedProblem,
  type GroupActivityItem,
  type MemberProfileResult,
  type GroupMemberProblemRow,
} from "@/types/prisma";
import { computeSolutionScore, getProblemHighlights } from "@/lib/scoring";
import type {
  GroupProblemEntry,
  MemberProblemEntry,
  MemberSolution,
} from "@/types/group";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

async function requireMembership(
  groupId: string,
  userId: string
): Promise<GroupMember> {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) throw new Error("Not a member of this group");
  return membership;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getMyGroups(): Promise<MyGroupMembership[]> {
  const user = await syncUser();
  if (!user) return [];

  return prisma.groupMember.findMany({
    where: { userId: user.id },
    include: myGroupMembershipInclude,
    orderBy: { joinedAt: "desc" },
  });
}

export async function getGroupWithMembers(
  groupId: string
): Promise<GroupWithMembersResult | null> {
  const user = await syncUser();
  if (!user) return null;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return null;

  const group: GroupWithMembersPayload | null =
    await prisma.group.findUnique({
      where: { id: groupId },
      include: groupWithMembersInclude,
    });

  if (!group) return null;

  const members: GroupMemberWithUser[] = group.members;
  const memberIds: string[] = members.map(
    (member: GroupMemberWithUser) => member.userId
  );

  const [problemCounts, revisionCounts]: [
    UserProblemCountByUser[],
    UserProblemCountByUser[],
  ] = await Promise.all([
    prisma.userProblem.groupBy({
      by: ["userId"],
      where: { userId: { in: memberIds } },
      _count: { id: true },
    }),
    prisma.userProblem.groupBy({
      by: ["userId"],
      where: { userId: { in: memberIds }, needsRevision: true },
      _count: { id: true },
    }),
  ]);

  const problemCountMap = new Map<string, number>(
    problemCounts.map((row: UserProblemCountByUser) => [
      row.userId,
      row._count.id,
    ])
  );
  const revisionCountMap = new Map<string, number>(
    revisionCounts.map((row: UserProblemCountByUser) => [
      row.userId,
      row._count.id,
    ])
  );

  const membersWithStats: GroupMemberWithStats[] = members.map(
    (member: GroupMemberWithUser): GroupMemberWithStats => ({
      ...member,
      problemCount: problemCountMap.get(member.userId) ?? 0,
      revisionCount: revisionCountMap.get(member.userId) ?? 0,
    })
  );

  return {
    ...group,
    members: membersWithStats,
    currentUserRole: membership.role,
    isOwner: group.ownerId === user.id,
    currentUserId: user.id,
  };
}

export async function getGroupSharedProblems(
  groupId: string
): Promise<GroupSharedProblem[]> {
  const user = await syncUser();
  if (!user) return [];

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return [];

  const members: GroupMemberUserId[] = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIds: string[] = members.map(
    (member: GroupMemberUserId) => member.userId
  );

  return prisma.userProblem.findMany({
    where: { userId: { in: memberIds } },
    include: groupSharedProblemInclude,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function getGroupActivity(
  groupId: string,
  limit = 25
): Promise<GroupActivityItem[]> {
  const user = await syncUser();
  if (!user) return [];

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return [];

  const members: GroupMemberUserId[] = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIds: string[] = members.map(
    (member: GroupMemberUserId) => member.userId
  );

  return prisma.solution.findMany({
    where: { userId: { in: memberIds } },
    include: groupActivityInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getMemberProfile(
  groupId: string,
  targetUserId: string
): Promise<MemberProfileResult | null> {
  const user = await syncUser();
  if (!user) return null;

  const [myMembership, targetMembership] = await Promise.all([
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    }),
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      include: memberProfileInclude,
    }),
  ]);

  if (!myMembership || !targetMembership) return null;

  const [problemCount, revisionCount, recentSolutions] = await Promise.all([
    prisma.userProblem.count({ where: { userId: targetUserId } }),
    prisma.userProblem.count({
      where: { userId: targetUserId, needsRevision: true },
    }),
    prisma.solution.findMany({
      where: { userId: targetUserId },
      include: memberRecentSolutionInclude,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    member: targetMembership,
    problemCount,
    revisionCount,
    recentSolutions,
  };
}

/**
 * Problem-centric group query.
 * Returns one entry per unique problem, with all member solutions aggregated.
 * Only members who have at least one solution appear in member lists.
 * Members are sorted by their best (highest-scoring) solution.
 */
export async function getGroupProblems(
  groupId: string
): Promise<GroupProblemEntry[]> {
  const user = await syncUser();
  if (!user) return [];

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return [];

  const memberRows: GroupMemberUserId[] = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIds = memberRows.map((m: GroupMemberUserId) => m.userId);

  const rows: GroupMemberProblemRow[] = await prisma.userProblem.findMany({
    where: { userId: { in: memberIds } },
    include: groupMemberSolutionInclude,
  });

  // Aggregate by unique problem
  const byProblem = new Map<
    string,
    {
      title: string;
      difficulty: string;
      url: string;
      memberEntries: MemberProblemEntry[];
      latestActivity: Date | null;
    }
  >();

  for (const row of rows) {
    const { problem, user: rowUser, solutions } = row;

    if (!byProblem.has(problem.id)) {
      byProblem.set(problem.id, {
        title: problem.title,
        difficulty: problem.difficulty,
        url: problem.url,
        memberEntries: [],
        latestActivity: null,
      });
    }

    // Skip members with no solutions
    if (solutions.length === 0) continue;

    const entry = byProblem.get(problem.id)!;

    const mappedSolutions: MemberSolution[] = solutions.map((sol) => ({
      solutionId: sol.id,
      title: sol.title,
      language: sol.language,
      code: sol.code,
      notes: sol.notes,
      solveTime: sol.solveTime,
      runtimeMs: sol.runtimeMs,
      runtimeBeatsPercent: sol.runtimeBeatsPercent,
      memoryBeatsPercent: sol.memoryBeatsPercent,
      timeComplexity: sol.timeComplexity,
      spaceComplexity: sol.spaceComplexity,
      score: computeSolutionScore(problem.difficulty, {
        solveTime: sol.solveTime,
        runtimeBeatsPercent: sol.runtimeBeatsPercent,
        memoryBeatsPercent: sol.memoryBeatsPercent,
        timeComplexity: sol.timeComplexity,
        spaceComplexity: sol.spaceComplexity,
      }),
      isBest: false,
      solvedAt: new Date(sol.createdAt),
    }));

    mappedSolutions.sort((a, b) => b.score - a.score);
    const bestScore = mappedSolutions[0]?.score ?? 0;
    if (mappedSolutions[0]) mappedSolutions[0].isBest = true;

    // Track latest activity (solutions already ordered desc by createdAt)
    const latest = new Date(solutions[0].createdAt);
    if (!entry.latestActivity || latest > entry.latestActivity) {
      entry.latestActivity = latest;
    }

    entry.memberEntries.push({
      userId: rowUser.id,
      userName: rowUser.name,
      userProblemId: row.id,
      isCurrentUser: rowUser.id === user.id,
      solutions: mappedSolutions,
      score: bestScore,
    });
  }

  return [...byProblem.entries()]
    .map(([problemId, data]) => {
      const sorted = [...data.memberEntries].sort(
        (a, b) => b.score - a.score
      );
      const winner =
        sorted[0] && sorted[0].score > 0
          ? {
              userId: sorted[0].userId,
              userName: sorted[0].userName,
              score: sorted[0].score,
            }
          : null;

      const { fastest, mostOptimized } = getProblemHighlights(sorted);

      return {
        problemId,
        title: data.title,
        difficulty: data.difficulty,
        url: data.url,
        members: sorted,
        participantCount: sorted.length,
        latestActivity: data.latestActivity,
        winner,
        fastestSolver: fastest,
        mostOptimizedSolver: mostOptimized
          ? {
              userId: mostOptimized.userId,
              userName: mostOptimized.userName,
              runtimeBeats: mostOptimized.runtimeBeats,
            }
          : null,
      } satisfies GroupProblemEntry;
    })
    .sort((a, b) => {
      const ta = a.latestActivity?.getTime() ?? 0;
      const tb = b.latestActivity?.getTime() ?? 0;
      return tb - ta;
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createGroup(data: CreateGroupInput): Promise<Group> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  let inviteCode = generateInviteCode();
  while (await prisma.group.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode();
  }

  const group = await prisma.group.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      inviteCode,
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: "owner" },
      },
    },
  });

  revalidatePath("/groups");
  return group;
}

export async function joinGroup(
  inviteCode: string
): Promise<{ group: Group; alreadyMember: boolean }> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) throw new Error("Invalid invite code");

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
  });
  if (existing) return { group, alreadyMember: true };

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: user.id, role: "member" },
  });

  revalidatePath("/groups");
  revalidatePath(`/groups/${group.id}`);
  return { group, alreadyMember: false };
}

export async function leaveGroup(groupId: string): Promise<void> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new Error("Group not found");
  if (group.ownerId === user.id) {
    throw new Error("Owner cannot leave. Delete the group instead.");
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: user.id } },
  });

  revalidatePath("/groups");
}

export async function deleteGroup(groupId: string): Promise<void> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const group = await prisma.group.findFirst({
    where: { id: groupId, ownerId: user.id },
  });
  if (!group) throw new Error("Not found or not authorized");

  await prisma.group.delete({ where: { id: groupId } });

  revalidatePath("/groups");
}

export async function removeGroupMember(
  groupId: string,
  targetUserId: string
): Promise<void> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const group = await prisma.group.findFirst({
    where: { id: groupId, ownerId: user.id },
  });
  if (!group) throw new Error("Not authorized");
  if (targetUserId === user.id) throw new Error("Cannot remove yourself");

  await requireMembership(groupId, targetUserId);

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: targetUserId } },
  });

  revalidatePath(`/groups/${groupId}`);
}

export async function getGroupByInviteCode(
  inviteCode: string
): Promise<GroupByInviteCode | null> {
  return prisma.group.findUnique({
    where: { inviteCode },
    include: groupByInviteCodeInclude,
  });
}

// Re-export types for components
export type {
  MyGroupMembership,
  GroupWithMembersResult,
  GroupMemberWithStats,
  GroupSharedProblem,
  GroupActivityItem,
  MemberProfileResult,
  MemberRecentSolution,
} from "@/types/prisma";

export type { GroupProblemEntry, MemberProblemEntry, MemberSolution } from "@/types/group";
