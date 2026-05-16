"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const name =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { name, email },
    create: { clerkId: userId, name, email },
  });

  return user;
}
