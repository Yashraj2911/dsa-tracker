"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/editor/code-editor";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SolutionForm } from "./solution-form";
import { deleteSolution } from "@/actions/solutions";
import {
  Plus,
  Clock,
  Trash2,
  Copy,
  Check,
  Calendar,
} from "lucide-react";

type Solution = {
  id: string;
  title: string;
  language: string;
  code: string;
  notes: string | null;
  solveTime: number | null;
  createdAt: Date;
};

interface SolutionTabsProps {
  solutions: Solution[];
  userProblemId: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function DeleteButton({
  solutionId,
  onDeleted,
}: {
  solutionId: string;
  onDeleted: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSolution(solutionId);
        toast.success("Solution deleted");
        onDeleted();
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={pending}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

export function SolutionTabs({ solutions, userProblemId }: SolutionTabsProps) {
  const [localSolutions, setLocalSolutions] = useState(solutions);
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    solutions[0]?.id ?? "add"
  );

  function getLanguageLabel(lang: string) {
    return SUPPORTED_LANGUAGES.find((l) => l.value === lang)?.label ?? lang;
  }

  function handleSolutionAdded() {
    setAddOpen(false);
  }

  function handleSolutionDeleted(id: string) {
    const remaining = localSolutions.filter((s) => s.id !== id);
    setLocalSolutions(remaining);
    if (activeTab === id) {
      setActiveTab(remaining[0]?.id ?? "add");
    }
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
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Solution</DialogTitle>
              </DialogHeader>
              <SolutionForm
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
        {/* Tab bar */}
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
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Solution</DialogTitle>
              </DialogHeader>
              <SolutionForm
                userProblemId={userProblemId}
                solutionNumber={localSolutions.length + 1}
                onSuccess={handleSolutionAdded}
                onCancel={() => setAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Solution content */}
        {localSolutions.map((solution) => (
          <TabsContent key={solution.id} value={solution.id} className="m-0">
            <div className="p-4 space-y-4">
              {/* Meta row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium">{solution.title}</h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground font-mono">
                    {getLanguageLabel(solution.language)}
                  </span>
                  {solution.solveTime !== null && (
                    <span className="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
                      <Clock className="h-2.5 w-2.5" />
                      {solution.solveTime}m
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 mr-2">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(solution.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <CopyButton code={solution.code} />
                  <DeleteButton
                    solutionId={solution.id}
                    onDeleted={() => handleSolutionDeleted(solution.id)}
                  />
                </div>
              </div>

              {/* Code editor */}
              <CodeEditor
                value={solution.code}
                language={solution.language}
                readOnly
                height="360px"
              />

              {/* Notes */}
              {solution.notes && (
                <div className="rounded-lg bg-muted/40 px-4 py-3 border border-border/50">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                    Notes
                  </p>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {solution.notes}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
