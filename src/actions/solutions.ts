"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncUser } from "./users";
import type { AddSolutionInput } from "@/lib/validations";
import type { Solution } from "@prisma/client";

export async function addSolution(
  userProblemId: string,
  data: AddSolutionInput
): Promise<Solution> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

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
      notes: data.notes ?? null,
      solveTime: data.solveTime ?? null,
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
  data: Partial<AddSolutionInput>
): Promise<Solution> {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const solution = await prisma.solution.findFirst({
    where: { id: solutionId, userId: user.id },
  });
  if (!solution) throw new Error("Not found");

  const updated = await prisma.solution.update({
    where: { id: solutionId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.solveTime !== undefined && { solveTime: data.solveTime }),
    },
  });

  revalidatePath(`/problems/${solution.userProblemId}`);
  return updated;
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
