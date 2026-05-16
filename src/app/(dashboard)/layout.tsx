import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { syncUser } from "@/actions/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await syncUser();

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <main className="ml-56 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
