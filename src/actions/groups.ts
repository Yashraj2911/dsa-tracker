"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { syncUser } from "./users";
import type { CreateGroupInput } from "@/lib/validations";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

async function requireMembership(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!membership) throw new Error("Not a member of this group");
  return membership;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getMyGroups() {
  const user = await syncUser();
  if (!user) return [];

  return prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function getGroupWithMembers(groupId: string) {
  const user = await syncUser();
  if (!user) return null;

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return null;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      },
    },
  });

  if (!group) return null;

  const memberIds = group.members.map((m) => m.userId);

  const [problemCounts, revisionCounts] = await Promise.all([
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

  const problemCountMap = new Map(problemCounts.map((p) => [p.userId, p._count.id]));
  const revisionCountMap = new Map(revisionCounts.map((p) => [p.userId, p._count.id]));

  const membersWithStats = group.members.map((m) => ({
    ...m,
    problemCount: problemCountMap.get(m.userId) ?? 0,
    revisionCount: revisionCountMap.get(m.userId) ?? 0,
  }));

  return {
    ...group,
    members: membersWithStats,
    currentUserRole: membership.role,
    isOwner: group.ownerId === user.id,
    currentUserId: user.id,
  };
}

export async function getGroupSharedProblems(groupId: string) {
  const user = await syncUser();
  if (!user) return [];

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return [];

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);

  return prisma.userProblem.findMany({
    where: { userId: { in: memberIds } },
    include: {
      problem: true,
      user: { select: { id: true, name: true } },
      solutions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { language: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function getGroupActivity(groupId: string, limit = 25) {
  const user = await syncUser();
  if (!user) return [];

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) return [];

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);

  return prisma.solution.findMany({
    where: { userId: { in: memberIds } },
    include: {
      user: { select: { id: true, name: true } },
      userProblem: {
        include: {
          problem: { select: { id: true, title: true, difficulty: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getMemberProfile(groupId: string, targetUserId: string) {
  const user = await syncUser();
  if (!user) return null;

  const [myMembership, targetMembership] = await Promise.all([
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    }),
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      include: { user: { select: { id: true, name: true, email: true } } },
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
      include: {
        userProblem: {
          include: {
            problem: { select: { title: true, difficulty: true } },
          },
        },
      },
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

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createGroup(data: CreateGroupInput) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  let inviteCode = generateInviteCode();
  // Collision guard (extremely unlikely but correct)
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

export async function joinGroup(inviteCode: string) {
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

export async function leaveGroup(groupId: string) {
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

export async function deleteGroup(groupId: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const group = await prisma.group.findFirst({
    where: { id: groupId, ownerId: user.id },
  });
  if (!group) throw new Error("Not found or not authorized");

  await prisma.group.delete({ where: { id: groupId } });

  revalidatePath("/groups");
}

export async function removeGroupMember(groupId: string, targetUserId: string) {
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

export async function getGroupByInviteCode(inviteCode: string) {
  return prisma.group.findUnique({
    where: { inviteCode },
    include: { _count: { select: { members: true } } },
  });
}
