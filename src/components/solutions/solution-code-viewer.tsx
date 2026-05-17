"use client";

import { useState } from "react";
import { ChevronDown, Code2 } from "lucide-react";
import { CodeEditor } from "@/components/editor/code-editor";
import { CopyCodeButton } from "./copy-code-button";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { cn } from "@/lib/utils";

interface SolutionCodeViewerProps {
  code: string;
  language: string;
  title?: string;
  /** Monaco mounts only when expanded */
  defaultExpanded?: boolean;
  height?: string;
  className?: string;
}

function getLanguageLabel(lang: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.value === lang)?.label ?? lang;
}

export function SolutionCodeViewer({
  code,
  language,
  title,
  defaultExpanded = false,
  height = "320px",
  className,
}: SolutionCodeViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-[#1a1a1a]/40 overflow-hidden",
        className
      )}
    >
      <div className="flex w-full items-center gap-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/20"
          aria-expanded={expanded}
          aria-controls="solution-code-panel"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Code2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {title ?? "Solution code"}
            </span>
            <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {getLanguageLabel(language)}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>
      </div>

      {expanded && (
        <div
          id="solution-code-panel"
          className="border-t border-border/40"
        >
          <div className="flex items-center justify-end px-2 pt-1.5">
            <CopyCodeButton code={code} />
          </div>
          <div className="p-2 pt-0">
            <CodeEditor
              value={code}
              language={language}
              readOnly
              height={height}
            />
          </div>
        </div>
      )}
    </div>
  );
}
