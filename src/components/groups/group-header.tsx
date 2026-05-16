"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteMemberDialog } from "./invite-member-dialog";
import { deleteGroup } from "@/actions/groups";
import { Crown, Users, Trash2, Loader2 } from "lucide-react";

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    inviteCode: string;
    ownerId: string;
    members: { id: string }[];
  };
  isOwner: boolean;
}

function DeleteGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        "Delete this group? This will remove all members. This cannot be undone."
      )
    )
      return;

    startTransition(async () => {
      try {
        await deleteGroup(groupId);
        toast.success("Group deleted");
        router.push("/groups");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete group");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Delete
    </Button>
  );
}

export function GroupHeader({ group, isOwner }: GroupHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
          {isOwner && (
            <Badge
              variant="outline"
              className="gap-1 border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
            >
              <Crown className="h-3 w-3" />
              Owner
            </Badge>
          )}
        </div>

        {group.description && (
          <p className="text-sm text-muted-foreground max-w-xl">
            {group.description}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {group.members.length}{" "}
          {group.members.length === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <InviteMemberDialog
          groupId={group.id}
          groupName={group.name}
          inviteCode={group.inviteCode}
        />
        {isOwner && <DeleteGroupButton groupId={group.id} />}
      </div>
    </div>
  );
}
