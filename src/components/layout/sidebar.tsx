"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Code2,
  Star,
  RefreshCw,
  Zap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "main",
    exact: true,
  },
  {
    href: "/problems",
    label: "All Problems",
    icon: Code2,
    section: "main",
    exact: false,
  },
  {
    href: "/problems?starred=true",
    label: "Starred",
    icon: Star,
    section: "main",
    exact: false,
    queryKey: "starred",
    queryVal: "true",
  },
  {
    href: "/problems?revision=true",
    label: "Needs Revision",
    icon: RefreshCw,
    section: "main",
    exact: false,
    queryKey: "revision",
    queryVal: "true",
  },
  {
    href: "/groups",
    label: "Groups",
    icon: Users,
    section: "collab",
    exact: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">
          DSA Tracker
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* Personal */}
        <div>
          <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
            Personal
          </p>
          <ul className="space-y-0.5">
            {navItems
              .filter((i) => i.section === "main")
              .map((item) => {
                let isActive = false;
                if (item.exact) {
                  isActive = pathname === "/";
                } else if ("queryKey" in item && item.queryKey) {
                  isActive =
                    pathname === "/problems" &&
                    searchParams.get(item.queryKey) === item.queryVal;
                } else {
                  isActive =
                    pathname.startsWith(item.href) &&
                    !searchParams.get("starred") &&
                    !searchParams.get("revision");
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-all duration-150",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive ? "text-primary" : "text-sidebar-foreground/40"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Collaborate */}
        <div>
          <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
            Collaborate
          </p>
          <ul className="space-y-0.5">
            {navItems
              .filter((i) => i.section === "collab")
              .map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-all duration-150",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive ? "text-primary" : "text-sidebar-foreground/40"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <UserButton
            appearance={{
              elements: { avatarBox: "h-6 w-6 rounded-md" },
            }}
          />
          <span className="text-xs text-sidebar-foreground/50 truncate">
            My Account
          </span>
        </div>
      </div>
    </aside>
  );
}
