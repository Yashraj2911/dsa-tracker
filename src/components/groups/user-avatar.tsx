import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function UserAvatar({ name, size = "sm", className }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary",
        size === "sm" && "h-6 w-6 text-[10px]",
        size === "md" && "h-8 w-8 text-xs",
        className
      )}
    >
      {initials}
    </span>
  );
}
