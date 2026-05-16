"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor) => {
      editorRef.current = editorInstance;

      if (!readOnly) {
        editorInstance.onDidPaste(() => {
          requestAnimationFrame(() => {
            void editorInstance
              .getAction("editor.action.formatDocument")
              ?.run();
          });
        });
      }
    },
    [readOnly]
  );

  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]/80 ring-1 ring-white/5"
      style={{ height }}
    >
      <MonacoEditor
        key={language}
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          fontSize: 13,
          fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          formatOnPaste: true,
          formatOnType: !readOnly,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          autoIndent: "full",
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "gutter",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          bracketPairColorization: { enabled: true },
          quickSuggestions: !readOnly,
          suggestOnTriggerCharacters: !readOnly,
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
