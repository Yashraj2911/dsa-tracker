"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  height = "400px",
}: CodeEditorProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        theme="vs-dark"
        options={{
          fontSize: 13,
          fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          formatOnPaste: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "gutter",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          bracketPairColorization: { enabled: true },
          quickSuggestions: !readOnly,
          folding: true,
          lineDecorationsWidth: 8,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
