import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground/20">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild size="sm" className="mt-6 gap-1.5">
        <Link href="/">
          <Home className="h-3.5 w-3.5" />
          Go home
        </Link>
      </Button>
    </div>
  );
}
