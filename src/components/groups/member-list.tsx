"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, UserMinus, Code2, RefreshCw } from "lucide-react";
import { removeGroupMember, leaveGroup } from "@/actions/groups";
import { useRouter } from "next/navigation";
import { MemberProfileDialog } from "./member-profile-dialog";
import type { GroupMemberWithStats } from "@/types/prisma";

interface MemberListProps {
  members: GroupMemberWithStats[];
  groupId: string;
  isOwner: boolean;
  currentUserId: string;
}

function MemberAvatar({ name }: { name: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
      {initials}
    </div>
  );
}

function RemoveButton({
  groupId,
  userId,
  name,
}: {
  groupId: string;
  userId: string;
  name: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeGroupMember(groupId, userId);
        toast.success(`${name ?? "Member"} removed`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to remove member");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleRemove}
      disabled={pending}
      className="h-6 w-6 opacity-0 group-hover/member:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
    >
      <UserMinus className="h-3 w-3" />
    </Button>
  );
}

function LeaveButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLeave() {
    startTransition(async () => {
      try {
        await leaveGroup(groupId);
        toast.success("Left the group");
        router.push("/groups");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to leave group");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLeave}
      disabled={pending}
      className="w-full h-7 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
    >
      Leave Group
    </Button>
  );
}

export function MemberList({
  members,
  groupId,
  isOwner,
  currentUserId,
}: MemberListProps) {
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            Members
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {members.length}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ul className="divide-y divide-border/50">
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isMemberOwner = member.role === "owner";

              return (
                <li
                  key={member.id}
                  className="group/member flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <button
                    onClick={() => setProfileUserId(member.userId)}
                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                  >
                    <MemberAvatar name={member.user.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {member.user.name ?? member.user.email ?? "Unknown"}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-muted-foreground/50">
                            (you)
                          </span>
                        )}
                        {isMemberOwner && (
                          <Crown className="h-3 w-3 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Code2 className="h-2.5 w-2.5" />
                          {member.problemCount}
                        </span>
                        {member.revisionCount > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-orange-400/80">
                            <RefreshCw className="h-2.5 w-2.5" />
                            {member.revisionCount}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/50">
                          {formatDistanceToNow(new Date(member.joinedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    {isMemberOwner ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-1.5"
                      >
                        owner
                      </Badge>
                    ) : (
                      isOwner &&
                      !isCurrentUser && (
                        <RemoveButton
                          groupId={groupId}
                          userId={member.userId}
                          name={member.user.name}
                        />
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {!isOwner && (
            <div className="border-t border-border/50 p-3">
              <LeaveButton groupId={groupId} />
            </div>
          )}
        </CardContent>
      </Card>

      {profileUserId && (
        <MemberProfileDialog
          groupId={groupId}
          targetUserId={profileUserId}
          open={!!profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}
    </>
  );
}
