import { formatDistanceToNow } from "date-fns";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { Code2, Zap } from "lucide-react";

type ActivityItem = {
  id: string;
  language: string;
  createdAt: Date;
  user: { id: string; name: string | null };
  userProblem: {
    problem: { id: string; title: string; difficulty: string };
  };
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

function UserAvatar({ name }: { name: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
      {initials}
    </div>
  );
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-16 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Zap className="h-4 w-4 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Activity appears when members add solutions
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <ul className="divide-y divide-border/50">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
          >
            <UserAvatar name={item.user.name} />

            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">
                  {item.user.name ?? "Someone"}
                </span>{" "}
                <span className="text-muted-foreground">solved</span>{" "}
                <span className="font-medium">
                  {item.userProblem.problem.title}
                </span>
              </p>
              <div className="mt-1 flex items-center gap-2">
                <DifficultyBadge
                  difficulty={item.userProblem.problem.difficulty}
                />
                <span className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  <Code2 className="h-2.5 w-2.5" />
                  {item.language}
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
