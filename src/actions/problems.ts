"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncUser } from "./users";
import type { AddProblemInput } from "@/lib/validations";
import type { UserProblem, Problem } from "@prisma/client";
import {
  userProblemWithProblemInclude,
  userProblemDetailInclude,
  revisionQueueInclude,
  type UserProblemWithProblem,
  type UserProblemDetail,
  type RevisionQueueItem,
} from "@/types/prisma";

export type DashboardStats = {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  revisionCount: number;
  starredCount: number;
};

export async function getProblems(filters?: {
  difficulty?: string;
  needsRevision?: boolean;
  starred?: boolean;
  language?: string;
  search?: string;
}): Promise<UserProblemWithProblem[]> {
  const user = await syncUser();
  if (!user) return [];

  return prisma.userProblem.findMany({
    where: {
      userId: user.id,
      ...(filters?.needsRevision !== undefined && {
        needsRevision: filters.needsRevision,
      }),
      ...(filters?.starred !== undefined && { starred: filters.starred }),
      problem: {
        ...(filters?.difficulty &&
          filters.difficulty !== "all" && {
            difficulty: filters.difficulty,
          }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { slug: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      ...(filters?.language &&
        filters.language !== "all" && {
          solutions: { some: { language: filters.language } },
        }),
    },
    include: userProblemWithProblemInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProblem(
  userProblemId: string
): Promise<UserProblemDetail | null> {
  const user = await syncUser();
  if (!user) return null;

  return prisma.userProblem.findFirst({
    where: { id: userProblemId, userId: user.id },
    include: userProblemDetailInclude,
  });
}

export async function addProblem(
  data: AddProblemInput
): Promise<
  | { userProblem: UserProblem; alreadyExists: true }
  | { userProblem: UserProblem & { problem: Problem }; alreadyExists: false }
> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const problem = await prisma.problem.upsert({
    where: { url: data.url },
    update: { title: data.title, difficulty: data.difficulty, tags: data.tags },
    create: {
      platform: "leetcode",
      slug: data.slug,
      title: data.title,
      difficulty: data.difficulty,
      tags: data.tags,
      url: data.url,
    },
  });

  const existing = await prisma.userProblem.findUnique({
    where: { userId_problemId: { userId: user.id, problemId: problem.id } },
  });

  if (existing) return { userProblem: existing, alreadyExists: true };

  const userProblem = await prisma.userProblem.create({
    data: { userId: user.id, problemId: problem.id },
    include: { problem: true },
  });

  revalidatePath("/problems");
  revalidatePath("/");
  return { userProblem, alreadyExists: false };
}

export async function toggleRevision(
  userProblemId: string
): Promise<UserProblem> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const up = await prisma.userProblem.findFirst({
    where: { id: userProblemId, userId: user.id },
  });
  if (!up) throw new Error("Not found");

  const updated = await prisma.userProblem.update({
    where: { id: userProblemId },
    data: { needsRevision: !up.needsRevision },
  });

  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath(`/problems/${userProblemId}`);
  return updated;
}

export async function toggleStarred(
  userProblemId: string
): Promise<UserProblem> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const up = await prisma.userProblem.findFirst({
    where: { id: userProblemId, userId: user.id },
  });
  if (!up) throw new Error("Not found");

  const updated = await prisma.userProblem.update({
    where: { id: userProblemId },
    data: { starred: !up.starred },
  });

  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath(`/problems/${userProblemId}`);
  return updated;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const user = await syncUser();
  if (!user) return null;

  const [total, easy, medium, hard, revisionCount, starredCount] =
    await Promise.all([
      prisma.userProblem.count({ where: { userId: user.id } }),
      prisma.userProblem.count({
        where: { userId: user.id, problem: { difficulty: "Easy" } },
      }),
      prisma.userProblem.count({
        where: { userId: user.id, problem: { difficulty: "Medium" } },
      }),
      prisma.userProblem.count({
        where: { userId: user.id, problem: { difficulty: "Hard" } },
      }),
      prisma.userProblem.count({
        where: { userId: user.id, needsRevision: true },
      }),
      prisma.userProblem.count({ where: { userId: user.id, starred: true } }),
    ]);

  return { total, easy, medium, hard, revisionCount, starredCount };
}

export async function getRecentProblems(
  limit = 6
): Promise<UserProblemWithProblem[]> {
  const user = await syncUser();
  if (!user) return [];

  return prisma.userProblem.findMany({
    where: { userId: user.id },
    include: userProblemWithProblemInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getRevisionQueue(
  limit = 5
): Promise<RevisionQueueItem[]> {
  const user = await syncUser();
  if (!user) return [];

  return prisma.userProblem.findMany({
    where: { userId: user.id, needsRevision: true },
    include: revisionQueueInclude,
    orderBy: { updatedAt: "asc" },
    take: limit,
  });
}

export type {
  UserProblemWithProblem,
  UserProblemDetail,
  RevisionQueueItem,
} from "@/types/prisma";

export async function fetchProblemMetadata(url: string) {
  const { extractSlugFromUrl, fetchLeetCodeProblem } = await import(
    "@/lib/leetcode"
  );

  const slug = extractSlugFromUrl(url);
  if (!slug) return { error: "Invalid LeetCode URL" as const };

  const data = await fetchLeetCodeProblem(slug);
  if (!data)
    return {
      error: "Could not fetch problem data. Please fill in manually." as const,
    };

  return { data };
}
