"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SolutionForm } from "./solution-form";
import { SolutionPanel } from "./solution-panel";
import type { SolutionRecord } from "@/types/solution";
import { Plus } from "lucide-react";

interface SolutionTabsProps {
  solutions: SolutionRecord[];
  userProblemId: string;
}

export function SolutionTabs({ solutions, userProblemId }: SolutionTabsProps) {
  const router = useRouter();
  const [localSolutions, setLocalSolutions] = useState(solutions);
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(solutions[0]?.id ?? "add");

  useEffect(() => {
    setLocalSolutions(solutions);
  }, [solutions]);

  function handleSolutionAdded() {
    setAddOpen(false);
    router.refresh();
  }

  function handleSolutionDeleted(id: string) {
    const remaining = localSolutions.filter((s) => s.id !== id);
    setLocalSolutions(remaining);
    if (activeTab === id) {
      setActiveTab(remaining[0]?.id ?? "add");
    }
    router.refresh();
  }

  if (localSolutions.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">No solutions yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first solution to this problem
          </p>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-4 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Solution
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Solution</DialogTitle>
              </DialogHeader>
              <SolutionForm
                mode="create"
                userProblemId={userProblemId}
                solutionNumber={1}
                onSuccess={handleSolutionAdded}
                onCancel={() => setAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
          <TabsList variant="line" className="gap-0 h-auto">
            {localSolutions.map((s, i) => (
              <TabsTrigger
                key={s.id}
                value={s.id}
                className="text-xs px-3 py-1.5 h-auto"
              >
                Solution {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Solution</DialogTitle>
              </DialogHeader>
              <SolutionForm
                mode="create"
                userProblemId={userProblemId}
                solutionNumber={localSolutions.length + 1}
                onSuccess={handleSolutionAdded}
                onCancel={() => setAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {localSolutions.map((solution) => (
          <TabsContent key={solution.id} value={solution.id} className="m-0">
            <SolutionPanel
              solution={solution}
              userProblemId={userProblemId}
              onDeleted={() => handleSolutionDeleted(solution.id)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
