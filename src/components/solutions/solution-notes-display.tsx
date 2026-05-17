"use client";

import { FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionNotesDisplayProps {
  notes: string | null;
  className?: string;
}

export function SolutionNotesDisplay({
  notes,
  className,
}: SolutionNotesDisplayProps) {
  const hasNotes = Boolean(notes?.trim());

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-muted/10 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Notes & approach
        </span>
      </div>

      <div className="px-3 py-3">
        {hasNotes ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/85">
            {notes}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
              <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground/50">
              No notes for this solution
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/35">
              Approach, edge cases, and learnings appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
