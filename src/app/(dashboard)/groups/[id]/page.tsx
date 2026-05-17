import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGroupWithMembers,
  getGroupProblems,
  getGroupActivity,
} from "@/actions/groups";
import { computeLeaderboard } from "@/lib/scoring";
import { GroupHeader } from "@/components/groups/group-header";
import { GroupTabs } from "@/components/groups/group-tabs";
import { MemberList } from "@/components/groups/member-list";
import { ChevronRight } from "lucide-react";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [group, groupProblems, activity] = await Promise.all([
    getGroupWithMembers(id),
    getGroupProblems(id),
    getGroupActivity(id),
  ]);

  if (!group) notFound();

  const membersList = group.members.map((m) => ({
    userId: m.userId,
    userName: m.user.name,
  }));

  const leaderboard = computeLeaderboard(groupProblems, membersList);

  return (
    <div className="min-h-full px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/groups" className="hover:text-foreground transition-colors">
          Groups
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{group.name}</span>
      </nav>

      {/* Header */}
      <GroupHeader group={group} isOwner={group.isOwner} />

      {/* Content grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main — tabs */}
        <div className="lg:col-span-2">
          <GroupTabs
            groupProblems={groupProblems}
            leaderboard={leaderboard}
            activity={activity.map((a) => ({
              ...a,
              createdAt: new Date(a.createdAt),
            }))}
            currentUserId={group.currentUserId}
          />
        </div>

        {/* Sidebar — members */}
        <div>
          <MemberList
            members={group.members.map((m) => ({
              ...m,
              joinedAt: new Date(m.joinedAt),
            }))}
            groupId={group.id}
            isOwner={group.isOwner}
            currentUserId={group.currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
