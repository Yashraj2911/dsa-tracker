"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateSolutionNotes } from "@/actions/solutions";
import { Pencil, Loader2, Check, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionNotesEditorProps {
  solutionId: string;
  initialNotes: string | null;
  onSaved?: (notes: string | null) => void;
}

export function SolutionNotesEditor({
  solutionId,
  initialNotes,
  onSaved,
}: SolutionNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [draft, setDraft] = useState(initialNotes ?? "");
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    setDraft(notes);
    setEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const trimmed = draft.trim();
        await updateSolutionNotes(solutionId, trimmed);
        const saved = trimmed || null;
        setNotes(trimmed);
        setEditing(false);
        onSaved?.(saved);
        toast.success("Notes saved");
      } catch {
        toast.error("Failed to save notes");
      }
    });
  }

  const hasNotes = notes.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        editing
          ? "border-primary/30 bg-gradient-to-br from-primary/5 to-muted/20 ring-1 ring-primary/10"
          : "border-border/50 bg-muted/20 hover:border-border/80"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Notes
          </span>
        </div>
        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setDraft(notes);
              setEditing(true);
            }}
          >
            <Pencil className="h-3 w-3" />
            {hasNotes ? "Edit" : "Add notes"}
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCancel}
              disabled={pending}
              className="h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleSave}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"Approach, key insights, time complexity…\n\nSupports line breaks and markdown-style formatting."}
            className="min-h-[120px] resize-y border-border/50 bg-background/60 font-mono text-sm leading-relaxed"
            autoFocus
          />
        ) : hasNotes ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/85">
            {notes}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            No notes yet — click &quot;Add notes&quot; to capture your approach.
          </p>
        )}
      </div>
    </div>
  );
}
