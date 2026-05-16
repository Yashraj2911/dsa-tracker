"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/editor/code-editor";
import { PerformanceMetricsBadges } from "./performance-metrics-badges";
import { SolutionNotesEditor } from "./solution-notes-editor";
import { SolutionForm } from "./solution-form";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import type { SolutionRecord } from "@/types/solution";
import {
  Copy,
  Check,
  Trash2,
  Calendar,
  Pencil,
} from "lucide-react";
import { deleteSolution } from "@/actions/solutions";
import { toast } from "sonner";
import { useTransition } from "react";

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

function getLanguageLabel(lang: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.value === lang)?.label ?? lang;
}

interface SolutionPanelProps {
  solution: SolutionRecord;
  userProblemId: string;
  onDeleted: () => void;
}

export function SolutionPanel({
  solution,
  userProblemId,
  onDeleted,
}: SolutionPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(solution.notes);

  if (editing) {
    return (
      <div className="p-4">
        <SolutionForm
          mode="edit"
          userProblemId={userProblemId}
          solutionId={solution.id}
          initial={{ ...solution, notes }}
          onSuccess={() => {
            setEditing(false);
            router.refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{solution.title}</h3>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              {getLanguageLabel(solution.language)}
            </span>
          </div>
          <PerformanceMetricsBadges
            metrics={{
              solveTime: solution.solveTime,
              runtimeMs: solution.runtimeMs,
              runtimeBeatsPercent: solution.runtimeBeatsPercent,
              memoryBeatsPercent: solution.memoryBeatsPercent,
              timeComplexity: solution.timeComplexity,
              spaceComplexity: solution.spaceComplexity,
            }}
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="mr-1 flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Calendar className="h-2.5 w-2.5" />
            {formatDistanceToNow(new Date(solution.createdAt), {
              addSuffix: true,
            })}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditing(true)}
            title="Edit solution"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <CopyButton code={solution.code} />
          <DeleteButton solutionId={solution.id} onDeleted={onDeleted} />
        </div>
      </div>

      {/* Code */}
      <CodeEditor
        value={solution.code}
        language={solution.language}
        readOnly
        height="360px"
      />

      {/* Notes */}
      <SolutionNotesEditor
        solutionId={solution.id}
        initialNotes={notes}
        onSaved={(saved) => {
          setNotes(saved);
          router.refresh();
        }}
      />
    </div>
  );
}
