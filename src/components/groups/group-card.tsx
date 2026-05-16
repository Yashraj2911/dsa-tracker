import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, ArrowRight } from "lucide-react";
import type { MyGroupMembership } from "@/types/prisma";

interface GroupCardProps {
  membership: MyGroupMembership;
  currentUserId: string;
}

export function GroupCard({ membership, currentUserId }: GroupCardProps) {
  const { group, role } = membership;
  const isOwner = group.owner.id === currentUserId;

  return (
    <Link href={`/groups/${group.id}`} className="block group">
      <Card className="hover:ring-foreground/20 transition-all duration-200 hover:-translate-y-px">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold truncate">
                {group.name}
              </CardTitle>
            </div>
            {isOwner && (
              <Badge
                variant="outline"
                className="shrink-0 gap-1 border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-[10px]"
              >
                <Crown className="h-2.5 w-2.5" />
                Owner
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {group.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {group.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {group._count.members}{" "}
                {group._count.members === 1 ? "member" : "members"}
              </span>
              <span>
                Joined{" "}
                {formatDistanceToNow(new Date(membership.joinedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
