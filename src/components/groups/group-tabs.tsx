"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupProblemsList } from "./group-problems-list";
import { GroupLeaderboard } from "./group-leaderboard";
import { ActivityFeed } from "./activity-feed";
import { Code2, Trophy, Zap } from "lucide-react";
import type { GroupProblemEntry } from "@/types/group";
import type { GroupLeaderboardResult } from "@/lib/scoring";
import type { GroupActivityItem } from "@/types/prisma";

interface GroupTabsProps {
  groupProblems: GroupProblemEntry[];
  leaderboard: GroupLeaderboardResult;
  activity: GroupActivityItem[];
  currentUserId: string;
}

export function GroupTabs({
  groupProblems,
  leaderboard,
  activity,
  currentUserId,
}: GroupTabsProps) {
  return (
    <Tabs defaultValue="problems">
      <TabsList variant="line" className="mb-4">
        <TabsTrigger value="problems" className="gap-1.5 text-xs">
          <Code2 className="h-3.5 w-3.5" />
          Problems
          <span className="ml-0.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {groupProblems.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="leaderboard" className="gap-1.5 text-xs">
          <Trophy className="h-3.5 w-3.5" />
          Leaderboard
          <span className="ml-0.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {leaderboard.entries.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-1.5 text-xs">
          <Zap className="h-3.5 w-3.5" />
          Activity
          <span className="ml-0.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {activity.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="problems">
        <GroupProblemsList problems={groupProblems} />
      </TabsContent>

      <TabsContent value="leaderboard">
        <GroupLeaderboard
          leaderboard={leaderboard}
          currentUserId={currentUserId}
        />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityFeed items={activity} />
      </TabsContent>
    </Tabs>
  );
}
