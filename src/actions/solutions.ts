"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncUser } from "./users";
import {
  AddSolutionSchema,
  UpdateSolutionSchema,
  type AddSolutionInput,
  type UpdateSolutionInput,
} from "@/lib/validations";
import type { Solution } from "@prisma/client";

function buildPerformanceData(
  data: Pick<
    AddSolutionInput,
    | "runtimeMs"
    | "runtimeBeatsPercent"
    | "memoryBeatsPercent"
    | "timeComplexity"
    | "spaceComplexity"
  >
) {
  return {
    runtimeMs: data.runtimeMs ?? null,
    runtimeBeatsPercent: data.runtimeBeatsPercent ?? null,
    memoryBeatsPercent: data.memoryBeatsPercent ?? null,
    timeComplexity: data.timeComplexity ?? null,
    spaceComplexity: data.spaceComplexity ?? null,
  };
}

export async function addSolution(
  userProblemId: string,
  raw: AddSolutionInput
): Promise<Solution> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = AddSolutionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const data = parsed.data;

  const up = await prisma.userProblem.findFirst({
    where: { id: userProblemId, userId: user.id },
  });
  if (!up) throw new Error("Not found");

  const solution = await prisma.solution.create({
    data: {
      userId: user.id,
      userProblemId,
      title: data.title,
      language: data.language,
      code: data.code,
      notes: data.notes?.trim() ? data.notes.trim() : null,
      solveTime: data.solveTime ?? null,
      ...buildPerformanceData(data),
    },
  });

  await prisma.userProblem.update({
    where: { id: userProblemId },
    data: { totalAttempts: { increment: 1 }, updatedAt: new Date() },
  });

  revalidatePath(`/problems/${userProblemId}`);
  revalidatePath("/");
  return solution;
}

export async function updateSolution(
  solutionId: string,
  raw: UpdateSolutionInput
): Promise<Solution> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = UpdateSolutionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const data = parsed.data;

  const existing = await prisma.solution.findFirst({
    where: { id: solutionId, userId: user.id },
  });
  if (!existing) throw new Error("Not found");

  const updated = await prisma.solution.update({
    where: { id: solutionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.notes !== undefined && {
        notes: data.notes?.trim() ? data.notes.trim() : null,
      }),
      ...(data.solveTime !== undefined && { solveTime: data.solveTime ?? null }),
      ...(data.runtimeMs !== undefined && {
        runtimeMs: data.runtimeMs ?? null,
      }),
      ...(data.runtimeBeatsPercent !== undefined && {
        runtimeBeatsPercent: data.runtimeBeatsPercent ?? null,
      }),
      ...(data.memoryBeatsPercent !== undefined && {
        memoryBeatsPercent: data.memoryBeatsPercent ?? null,
      }),
      ...(data.timeComplexity !== undefined && {
        timeComplexity: data.timeComplexity ?? null,
      }),
      ...(data.spaceComplexity !== undefined && {
        spaceComplexity: data.spaceComplexity ?? null,
      }),
    },
  });

  revalidatePath(`/problems/${existing.userProblemId}`);
  return updated;
}

export async function updateSolutionNotes(
  solutionId: string,
  notes: string
): Promise<Solution> {
  return updateSolution(solutionId, { notes });
}

export async function deleteSolution(solutionId: string): Promise<void> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const solution = await prisma.solution.findFirst({
    where: { id: solutionId, userId: user.id },
  });
  if (!solution) throw new Error("Not found");

  await prisma.solution.delete({ where: { id: solutionId } });

  await prisma.userProblem.update({
    where: { id: solution.userProblemId },
    data: { totalAttempts: { decrement: 1 } },
  });

  revalidatePath(`/problems/${solution.userProblemId}`);
}
