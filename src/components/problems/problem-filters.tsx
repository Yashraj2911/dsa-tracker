"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Star, RefreshCw, X } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { cn } from "@/lib/utils";

export function ProblemFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "all";
  const language = searchParams.get("language") ?? "all";
  const starred = searchParams.get("starred") === "true";
  const revision = searchParams.get("revision") === "true";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const hasFilters =
    search || difficulty !== "all" || language !== "all" || starred || revision;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search problems…"
          className="h-8 pl-8 w-52 text-sm"
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
        />
      </div>

      {/* Difficulty */}
      <Select
        value={difficulty}
        onValueChange={(v) => updateParams({ difficulty: v })}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="Easy">Easy</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Hard">Hard</SelectItem>
        </SelectContent>
      </Select>

      {/* Language */}
      <Select
        value={language}
        onValueChange={(v) => updateParams({ language: v })}
      >
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Starred toggle */}
      <Button
        variant={starred ? "default" : "outline"}
        size="sm"
        className={cn("h-8 gap-1.5", starred && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30")}
        onClick={() => updateParams({ starred: starred ? null : "true" })}
      >
        <Star className={cn("h-3.5 w-3.5", starred && "fill-yellow-400")} />
        Starred
      </Button>

      {/* Revision toggle */}
      <Button
        variant={revision ? "default" : "outline"}
        size="sm"
        className={cn("h-8 gap-1.5", revision && "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30")}
        onClick={() => updateParams({ revision: revision ? null : "true" })}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Revision
      </Button>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-muted-foreground hover:text-foreground"
          onClick={() =>
            router.replace(pathname)
          }
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
