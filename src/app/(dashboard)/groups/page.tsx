import { Suspense } from "react";
import { getMyGroups } from "@/actions/groups";
import { syncUser } from "@/actions/users";
import { GroupCard } from "@/components/groups/group-card";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

async function GroupsList() {
  const [memberships, user] = await Promise.all([
    getMyGroups(),
    syncUser(),
  ]);

  if (!user) return null;

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 border-dashed bg-card/50 py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-medium">No groups yet</h3>
        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground leading-relaxed">
          Create a group to collaborate with friends, track progress together,
          and share solutions.
        </p>
        <div className="mt-6">
          <CreateGroupDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {memberships.map((m) => (
        <GroupCard key={m.id} membership={m} currentUserId={user.id} />
      ))}
    </div>
  );
}

function GroupsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <div className="min-h-full px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Groups</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Collaborate and track progress with others
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      <Suspense fallback={<GroupsListSkeleton />}>
        <GroupsList />
      </Suspense>
    </div>
  );
}
