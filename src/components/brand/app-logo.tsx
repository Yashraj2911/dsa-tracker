import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  /**
   * "icon"    — logo mark only
   * "inline"  — logo mark + name side by side  (sidebar)
   * "stacked" — logo mark + name + tagline stacked  (auth / landing)
   */
  variant?: "icon" | "inline" | "stacked";
  className?: string;
}

const iconSizes = {
  icon: 28,
  inline: 28,
  stacked: 44,
};

export function AppLogo({ variant = "inline", className }: AppLogoProps) {
  const size = iconSizes[variant];

  const mark = (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-lg",
        variant === "stacked" ? "rounded-xl" : "rounded-lg"
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/favicon-96x96.png"
        alt={APP_CONFIG.name}
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );

  if (variant === "icon") return <span className={className}>{mark}</span>;

  if (variant === "inline") {
    return (
      <span className={cn("flex items-center gap-2.5", className)}>
        {mark}
        <span className="font-semibold text-sm tracking-tight leading-none">
          {APP_CONFIG.name}
          <span className="text-muted-foreground font-normal ml-1 text-xs hidden lg:inline">
            DSA
          </span>
        </span>
      </span>
    );
  }

  // stacked — auth pages
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
        <div className="relative overflow-hidden rounded-2xl">
          {mark}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold tracking-tight">{APP_CONFIG.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-widest">
          {APP_CONFIG.tagline}
        </p>
      </div>
    </div>
  );
}
