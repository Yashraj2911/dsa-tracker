"use client";

import { useState, useTransition } from "react";
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
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { addSolution } from "@/actions/solutions";
import { Loader2, Clock } from "lucide-react";

interface SolutionFormProps {
  userProblemId: string;
  solutionNumber: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SolutionForm({
  userProblemId,
  solutionNumber,
  onSuccess,
  onCancel,
}: SolutionFormProps) {
  const [title, setTitle] = useState(`Solution ${solutionNumber}`);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [solveTime, setSolveTime] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!code.trim()) {
      toast.error("Please write some code");
      return;
    }

    startTransition(async () => {
      try {
        await addSolution(userProblemId, {
          title,
          language,
          code,
          notes: notes || undefined,
          solveTime: solveTime ? Number(solveTime) : undefined,
        });
        toast.success("Solution saved!");
        onSuccess?.();
      } catch {
        toast.error("Failed to save solution");
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Solve Time (minutes)
          </label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 25"
            value={solveTime}
            onChange={(e) => setSolveTime(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Notes
          </label>
          <Textarea
            placeholder="Key insight, approach notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-[38px] min-h-[38px] resize-none text-sm"
            rows={1}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
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
          ) : (
            "Save Solution"
          )}
        </Button>
      </div>
    </div>
  );
}
