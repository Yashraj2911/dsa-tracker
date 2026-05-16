"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Star, RefreshCw } from "lucide-react";
import { toggleStarred, toggleRevision } from "@/actions/problems";
import { cn } from "@/lib/utils";

interface ProblemActionsProps {
  userProblemId: string;
  starred: boolean;
  needsRevision: boolean;
}

export function ProblemActions({
  userProblemId,
  starred: initialStarred,
  needsRevision: initialRevision,
}: ProblemActionsProps) {
  const [starred, setStarred] = useState(initialStarred);
  const [needsRevision, setNeedsRevision] = useState(initialRevision);
  const [starPending, startStar] = useTransition();
  const [revPending, startRev] = useTransition();

  function handleStar() {
    startStar(async () => {
      try {
        await toggleStarred(userProblemId);
        setStarred((v) => !v);
        toast.success(starred ? "Unstarred" : "Starred!");
      } catch {
        toast.error("Failed to update");
      }
    });
  }

  function handleRevision() {
    startRev(async () => {
      try {
        await toggleRevision(userProblemId);
        setNeedsRevision((v) => !v);
        toast.success(
          needsRevision ? "Removed from revision queue" : "Added to revision queue"
        );
      } catch {
        toast.error("Failed to update");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleStar}
        disabled={starPending}
        className={cn(
          "gap-1.5 h-8",
          starred &&
            "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
        )}
      >
        <Star
          className={cn("h-3.5 w-3.5", starred && "fill-yellow-400")}
        />
        {starred ? "Starred" : "Star"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRevision}
        disabled={revPending}
        className={cn(
          "gap-1.5 h-8",
          needsRevision &&
            "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
        )}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {needsRevision ? "Needs Revision" : "Mark Revision"}
      </Button>
    </div>
  );
}
