"use client";

import { useState, useTransition, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { getMemberProfile } from "@/actions/groups";
import type { MemberProfileResult } from "@/types/prisma";
import { Code2, RefreshCw, Clock, Calendar } from "lucide-react";

interface MemberProfileDialogProps {
  groupId: string;
  targetUserId: string;
  open: boolean;
  onClose: () => void;
}

export function MemberProfileDialog({
  groupId,
  targetUserId,
  open,
  onClose,
}: MemberProfileDialogProps) {
  const [profile, setProfile] = useState<MemberProfileResult | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (open && targetUserId) {
      setProfile(null);
      startTransition(async () => {
        const data = await getMemberProfile(groupId, targetUserId);
        setProfile(data);
      });
    }
  }, [open, targetUserId, groupId]);

  const name =
    profile?.member.user.name ??
    profile?.member.user.email ??
    "Member";

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Member Profile</DialogTitle>
        </DialogHeader>

        {!profile ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Identity */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 border border-border/50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  Joined{" "}
                  {formatDistanceToNow(new Date(profile.member.joinedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/50 bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{profile.problemCount}</p>
                <p className="text-[10px] text-muted-foreground">Problems solved</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <p className="text-2xl font-bold">{profile.revisionCount}</p>
                <p className="text-[10px] text-muted-foreground">Needs revision</p>
              </div>
            </div>

            {/* Recent solutions */}
            {profile.recentSolutions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Recent Activity
                </p>
                <ul className="space-y-1.5">
                  {profile.recentSolutions.map((sol) => (
                    <li
                      key={sol.id}
                      className="flex items-center gap-2 rounded-md bg-muted/30 px-2.5 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {sol.userProblem.problem.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <DifficultyBadge
                            difficulty={sol.userProblem.problem.difficulty}
                          />
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 rounded px-1">
                            {sol.language}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground/50">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(sol.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profile.problemCount === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                No problems solved yet
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
