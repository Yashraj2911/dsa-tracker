"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharedProblemsTable } from "./shared-problems-table";
import { ActivityFeed } from "./activity-feed";
import { Code2, Zap } from "lucide-react";

type SharedProblem = {
  id: string;
  needsRevision: boolean;
  starred: boolean;
  updatedAt: Date;
  user: { id: string; name: string | null };
  problem: { title: string; difficulty: string; tags: string[]; url: string };
  solutions: { language: string; createdAt: Date }[];
};

type ActivityItem = {
  id: string;
  language: string;
  createdAt: Date;
  user: { id: string; name: string | null };
  userProblem: {
    problem: { id: string; title: string; difficulty: string };
  };
};

interface GroupTabsProps {
  problems: SharedProblem[];
  activity: ActivityItem[];
  currentUserId: string;
}

export function GroupTabs({
  problems,
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
            {problems.length}
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
        <SharedProblemsTable
          problems={problems}
          currentUserId={currentUserId}
        />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityFeed items={activity} />
      </TabsContent>
    </Tabs>
  );
}
