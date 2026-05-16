"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Star, RefreshCw } from "lucide-react";
import { toggleStarred, toggleRevision } from "@/actions/problems";
import { cn } from "@/lib/utils";

interface ProblemRowActionsProps {
  userProblemId: string;
  starred: boolean;
  needsRevision: boolean;
}

export function ProblemRowActions({
  userProblemId,
  starred: initialStarred,
  needsRevision: initialRevision,
}: ProblemRowActionsProps) {
  const [starred, setStarred] = useState(initialStarred);
  const [needsRevision, setNeedsRevision] = useState(initialRevision);
  const [starPending, startStar] = useTransition();
  const [revPending, startRev] = useTransition();

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startStar(async () => {
            try {
              await toggleStarred(userProblemId);
              setStarred((v) => !v);
            } catch {
              toast.error("Failed");
            }
          });
        }}
        disabled={starPending}
        className="h-6 w-6"
      >
        <Star
          className={cn(
            "h-3 w-3",
            starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startRev(async () => {
            try {
              await toggleRevision(userProblemId);
              setNeedsRevision((v) => !v);
            } catch {
              toast.error("Failed");
            }
          });
        }}
        disabled={revPending}
        className="h-6 w-6"
      >
        <RefreshCw
          className={cn(
            "h-3 w-3",
            needsRevision ? "text-orange-400" : "text-muted-foreground"
          )}
        />
      </Button>
    </div>
  );
}
