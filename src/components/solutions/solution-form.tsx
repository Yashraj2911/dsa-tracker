"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/editor/code-editor";
import { SolutionPerformanceFields } from "./solution-performance-fields";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { addSolution, updateSolution } from "@/actions/solutions";
import {
  AddSolutionSchema,
  SolutionSchema,
  parseMetricsFromForm,
  parseComplexityFromForm,
  parseSolveTimeFromForm,
} from "@/lib/validations";
import {
  emptyPerformanceFormState,
  performanceFromSolution,
  type SolutionPerformanceFormState,
} from "@/lib/solution-utils";
import type { SolutionRecord } from "@/types/solution";
import { Loader2, Clock } from "lucide-react";

interface SolutionFormProps {
  mode: "create" | "edit";
  userProblemId: string;
  solutionId?: string;
  solutionNumber?: number;
  initial?: SolutionRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SolutionForm({
  mode,
  userProblemId,
  solutionId,
  solutionNumber = 1,
  initial,
  onSuccess,
  onCancel,
}: SolutionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(
    initial?.title ?? `Solution ${solutionNumber}`
  );
  const [language, setLanguage] = useState(initial?.language ?? "python");
  const [code, setCode] = useState(initial?.code ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [solveTime, setSolveTime] = useState(
    initial?.solveTime !== null && initial?.solveTime !== undefined
      ? String(initial.solveTime)
      : ""
  );
  const [performance, setPerformance] = useState<SolutionPerformanceFormState>(
    initial ? performanceFromSolution(initial) : emptyPerformanceFormState()
  );
  const [pending, startTransition] = useTransition();

  function buildPayload() {
    const metricsParsed = parseMetricsFromForm(performance);
    const complexityParsed = parseComplexityFromForm(performance);
    const solveTimeParsed = parseSolveTimeFromForm(solveTime);

    return {
      title: title.trim(),
      language,
      code,
      notes: notes.trim() || undefined,
      solveTime: solveTimeParsed,
      ...metricsParsed,
      ...complexityParsed,
    };
  }

  function handleSubmit() {
    if (!code.trim()) {
      toast.error("Please write some code");
      return;
    }

    const payload = buildPayload();
    const schema = mode === "create" ? AddSolutionSchema : SolutionSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await addSolution(userProblemId, parsed.data);
          toast.success("Solution saved!");
        } else {
          if (!solutionId) throw new Error("Missing solution id");
          await updateSolution(solutionId, parsed.data);
          toast.success("Solution updated!");
        }
        router.refresh();
        onSuccess?.();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to save solution"
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Two Pointer Approach"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Language
          </label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Code
        </label>
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          height="320px"
        />
      </div>

      <SolutionPerformanceFields
        performance={performance}
        onChange={setPerformance}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            Solve time (minutes)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 25"
            value={solveTime}
            onChange={(e) => setSolveTime(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <label className="text-xs font-medium text-muted-foreground">
            Notes
          </label>
          <Textarea
            placeholder="Key insights, approach…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] resize-y text-sm leading-relaxed"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1"
            disabled={pending}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={pending || !code.trim()}
          className="flex-1"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : mode === "create" ? (
            "Save Solution"
          ) : (
            "Update Solution"
          )}
        </Button>
      </div>
    </div>
  );
}
