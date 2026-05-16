"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, ExternalLink, X } from "lucide-react";
import { addProblem, fetchProblemMetadata } from "@/actions/problems";
import { extractSlugFromUrl } from "@/lib/leetcode";
import { cn } from "@/lib/utils";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export function AddProblemDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"url" | "details">("url");

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | ""
  >("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [fetching, startFetch] = useTransition();
  const [submitting, startSubmit] = useTransition();

  function reset() {
    setStep("url");
    setUrl("");
    setTitle("");
    setDifficulty("");
    setTags([]);
    setTagInput("");
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    setOpen(open);
  }

  function handleFetch() {
    if (!url.trim()) {
      toast.error("Please enter a LeetCode URL");
      return;
    }

    const slug = extractSlugFromUrl(url);
    if (!slug) {
      toast.error("Invalid LeetCode URL");
      return;
    }

    startFetch(async () => {
      const result = await fetchProblemMetadata(url);
      if ("error" in result) {
        toast.warning(result.error, {
          description: "You can fill in the details manually",
        });
        setStep("details");
        return;
      }
      setTitle(result.data.title);
      setDifficulty(result.data.difficulty);
      setTags(result.data.tags);
      setStep("details");
    });
  }

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!difficulty) {
      toast.error("Difficulty is required");
      return;
    }

    const slug = extractSlugFromUrl(url) ?? url;
    const normalizedUrl = url.includes("leetcode.com")
      ? `https://leetcode.com/problems/${slug}/`
      : url;

    startSubmit(async () => {
      try {
        const result = await addProblem({
          url: normalizedUrl,
          title: title.trim(),
          difficulty: difficulty as "Easy" | "Medium" | "Hard",
          tags,
          slug,
        });

        if (result.alreadyExists) {
          toast.info("Problem already in your list");
        } else {
          toast.success("Problem added!");
        }

        setOpen(false);
        reset();
        router.push(`/problems/${result.userProblem.id}`);
      } catch {
        toast.error("Failed to add problem");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Problem
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "url" ? "Add LeetCode Problem" : "Problem Details"}
          </DialogTitle>
        </DialogHeader>

        {step === "url" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                LeetCode URL
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://leetcode.com/problems/two-sum/"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  className="flex-1"
                />
                <Button
                  onClick={handleFetch}
                  disabled={fetching || !url.trim()}
                  size="sm"
                >
                  {fetching ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll auto-fill the title, difficulty, and tags from
                LeetCode
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                if (!url.trim()) {
                  toast.error("Please enter a URL first");
                  return;
                }
                setStep("details");
              }}
            >
              Fill in manually
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* URL display */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {url}
              </a>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <Input
                placeholder="Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Difficulty
              </label>
              <Select
                value={difficulty}
                onValueChange={(v) =>
                  setDifficulty(v as "Easy" | "Medium" | "Hard")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tags
              </label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 hover:text-foreground"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Input
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setStep("url")}
              >
                Back
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !difficulty}
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save Problem"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddProblemButtonWithIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <AddProblemDialog />
    </div>
  );
}
